import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { Frontmatter, TANDA_LAPIS2, type Modul } from './types';

export const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Baca semua modul dari `content/<track>/<nomor>-<slug>.md`.
 *
 * Berkas/direktori yang diawali `_` dilewati (`_template-modul.md`, `_data/`): itu
 * contoh format dan data, bukan modul yang bisa dibuka pembaca.
 *
 * Melempar error yang menyebut berkas + field, bukan mengembalikan daftar kosong:
 * modul rusak harus menghentikan build (FR-02, NFR-12).
 */
export async function loadSemuaModul(): Promise<Modul[]> {
  const trackDirs = (await fs.readdir(CONTENT_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => d.name)
    .sort();

  const modul: Modul[] = [];
  for (const track of trackDirs) {
    const dir = path.join(CONTENT_DIR, track);
    const berkas = (await fs.readdir(dir))
      .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
      .sort();
    for (const nama of berkas) {
      modul.push(await bacaModul(path.join(dir, nama), `${track}/${nama}`));
    }
  }
  return modul;
}

async function bacaModul(penuh: string, relatif: string): Promise<Modul> {
  const mentah = await fs.readFile(penuh, 'utf8');
  const { data, content } = matter(mentah);

  const hasil = Frontmatter.safeParse(data);
  if (!hasil.success) {
    const rinci = hasil.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
    throw new Error(`Frontmatter tidak valid di ${relatif} — ${rinci}`);
  }
  if (!content.includes(TANDA_LAPIS2)) {
    throw new Error(`${relatif} tidak punya heading "${TANDA_LAPIS2}" (lapis 2 wajib, BR-02)`);
  }

  // Nama berkas harus mengikuti nomor + slug di frontmatter: dua modul dengan slug sama
  // akan saling menimpa halaman tanpa pesan apa pun kalau ini tidak diperiksa.
  const harapan = `${String(hasil.data.nomor).padStart(2, '0')}-${hasil.data.slug}.md`;
  if (path.basename(relatif) !== harapan) {
    throw new Error(`${relatif}: nama berkas harus "${harapan}" (dari nomor + slug di frontmatter)`);
  }

  return { berkas: relatif, frontmatter: hasil.data, isi: content };
}

/** Pisahkan badan markdown jadi lapis 1 (sebelum `## Lapis 2`) dan lapis 2. */
export function pisahLapis(isi: string): { lapis1: string; lapis2: string } {
  const i = isi.indexOf(TANDA_LAPIS2);
  if (i < 0) return { lapis1: isi, lapis2: '' };
  return {
    lapis1: isi.slice(0, i).trim(),
    // Heading "## Lapis 2" dibuang: judulnya sudah jadi <summary> di komponen.
    lapis2: isi.slice(i + TANDA_LAPIS2.length).replace(/^\s*\n/, '').trim(),
  };
}
