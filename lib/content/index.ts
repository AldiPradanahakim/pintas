import { cache } from 'react';
import { loadSemuaModul, pisahLapis } from './load';
import { daftarHeading, renderMarkdown, teksPolos, type Heading } from './render';
import type { Modul, ModulRingkas } from './types';
import type { EntriIndeks } from '../search/tipe';

export type { Modul, ModulRingkas } from './types';
export type { Heading } from './render';
export type { EntriIndeks } from '../search/tipe';

const ringkasDari = (m: Modul): ModulRingkas => ({
  track: m.frontmatter.track,
  slug: m.frontmatter.slug,
  nomor: m.frontmatter.nomor,
  judul: m.frontmatter.judul,
  estimasi_menit: m.frontmatter.estimasi_menit,
  prasyarat: m.frontmatter.prasyarat,
  jenisLatihan: [...new Set(m.frontmatter.latihan.map((l) => l.jenis))],
  jumlahSoal: m.frontmatter.kuis.length,
  url: `/modul/${m.frontmatter.track}/${m.frontmatter.slug}`,
});

/**
 * `cache()` menyimpan hasil per-render. Tanpa ini, `generateStaticParams`,
 * `generateMetadata`, dan halaman membaca + mem-parse disk tiga kali untuk data yang sama.
 */
export const semuaModul = cache(async (): Promise<Modul[]> => {
  const daftar = await loadSemuaModul();
  // Urut track lalu nomor: daftar track dan navigasi sebelumnya/berikutnya bergantung pada
  // urutan ini, jadi diurutkan sekali di sini, bukan di tiap pemakai.
  return daftar.sort((a, b) =>
    a.frontmatter.track === b.frontmatter.track
      ? a.frontmatter.nomor - b.frontmatter.nomor
      : a.frontmatter.track.localeCompare(b.frontmatter.track),
  );
});

export const semuaModulRingkas = cache(async (): Promise<ModulRingkas[]> =>
  (await semuaModul()).map(ringkasDari),
);

export const modulDariTrack = cache(async (track: string): Promise<Modul[]> =>
  (await semuaModul()).filter((m) => m.frontmatter.track === track),
);

export const cariModul = cache(async (track: string, slug: string): Promise<Modul | null> => {
  const semua = await semuaModul();
  return semua.find((m) => m.frontmatter.track === track && m.frontmatter.slug === slug) ?? null;
});

export interface ModulRender {
  modul: Modul;
  htmlLapis1: string;
  htmlLapis2: string;
  /** Heading lapis 1 untuk daftar isi; heading lapis 2 punya daftar sendiri. */
  toc: Heading[];
  tocLapis2: Heading[];
  sebelumnya: ModulRingkas | null;
  berikutnya: ModulRingkas | null;
}

/** Render satu modul: dua lapis terpisah, daftar isi, dan tetangga urutannya. */
export const renderModul = cache(async (track: string, slug: string): Promise<ModulRender | null> => {
  const modul = await cariModul(track, slug);
  if (!modul) return null;

  const { lapis1, lapis2 } = pisahLapis(modul.isi);
  const [htmlLapis1, htmlLapis2] = await Promise.all([renderMarkdown(lapis1), renderMarkdown(lapis2)]);

  const satuTrack = await modulDariTrack(track);
  const i = satuTrack.findIndex((m) => m.frontmatter.slug === slug);

  return {
    modul,
    htmlLapis1,
    htmlLapis2,
    toc: daftarHeading(lapis1),
    tocLapis2: daftarHeading(lapis2),
    sebelumnya: i > 0 ? ringkasDari(satuTrack[i - 1]) : null,
    berikutnya: i >= 0 && i < satuTrack.length - 1 ? ringkasDari(satuTrack[i + 1]) : null,
  };
});

/**
 * Bahan indeks pencarian. Kode ikut masuk `teks` — FR-07 meminta kata yang hanya muncul
 * di dalam blok kode tetap menemukan modulnya.
 */
export const entriIndeks = cache(async (): Promise<EntriIndeks[]> =>
  (await semuaModul()).map((m) => ({
    track: m.frontmatter.track,
    slug: m.frontmatter.slug,
    nomor: m.frontmatter.nomor,
    judul: m.frontmatter.judul,
    heading: daftarHeading(m.isi).map((h) => h.teks),
    teks: teksPolos(m.isi),
    url: `/modul/${m.frontmatter.track}/${m.frontmatter.slug}`,
  })),
);
