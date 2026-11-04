import Fuse from 'fuse.js';
import type { EntriIndeks } from './tipe';

export interface HasilCari {
  track: string;
  slug: string;
  nomor: number;
  judul: string;
  url: string;
  /** Potongan teks di sekitar kata kunci. */
  cuplikan: string;
  skor: number;
}

export interface OpsiCari {
  /** Filter track (chip). null/undefined = semua. */
  track?: string | null;
  batas?: number;
}

/**
 * Pencarian di klien atas indeks hasil build (FR-08: nol permintaan jaringan).
 *
 * Fuse, bukan `includes()`: toleransi salah ketik (`midleware` → `middleware`, FR-10)
 * sudah ditangani `threshold`, dan hasilnya bisa diurutkan menurut skor.
 * Bobot judul > heading > isi — judul modul adalah sinyal terkuat niat pengguna.
 */
export function cariModul(indeks: EntriIndeks[], kata: string, opsi: OpsiCari = {}): HasilCari[] {
  const q = kata.trim();
  if (q.length < 2) return [];

  const fuse = new Fuse(indeks, {
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: 'judul', weight: 3 },
      { name: 'heading', weight: 2 },
      { name: 'teks', weight: 1 },
    ],
  });

  const batas = opsi.batas ?? 40;
  const hasil: HasilCari[] = [];
  // Ambil lebih banyak dari batas karena filter track bisa membuang sebagian.
  for (const { item, score } of fuse.search(q, { limit: batas * 3 })) {
    if (opsi.track && item.track !== opsi.track) continue;
    hasil.push({
      track: item.track,
      slug: item.slug,
      nomor: item.nomor,
      judul: item.judul,
      url: item.url,
      cuplikan: cuplikan(item, q),
      skor: score ?? 0,
    });
    if (hasil.length >= batas) break;
  }
  return hasil;
}

/**
 * ±100 karakter di sekitar kemunculan pertama kata kunci. Kalau kata hanya ada di judul
 * atau heading, cuplikan memakai heading yang cocok — lebih berguna daripada potongan
 * awal teks yang tidak memuat kata yang dicari.
 */
function cuplikan(item: EntriIndeks, kata: string): string {
  const k = kata.toLowerCase();
  const i = item.teks.toLowerCase().indexOf(k);

  if (i < 0) {
    const h = item.heading.find((x) => x.toLowerCase().includes(k));
    if (h) return `Bagian: ${h}`;
    return item.teks.slice(0, 130) + (item.teks.length > 130 ? '…' : '');
  }

  const mulai = Math.max(0, i - 45);
  const akhir = Math.min(item.teks.length, i + k.length + 55);
  return (mulai > 0 ? '…' : '') + item.teks.slice(mulai, akhir).trim() + (akhir < item.teks.length ? '…' : '');
}
