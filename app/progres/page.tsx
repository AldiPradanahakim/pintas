import type { Metadata } from 'next';
import Progres from '@/components/progres/Progres';
import { semuaModul } from '@/lib/content';

/**
 * H7 — Progres (PRD F-10, SRS FR-25..FR-28).
 *
 * Halaman ini seluruhnya klien: datanya hanya ada di localStorage. Server cuma
 * mengirim daftar modul (untuk menghitung ringkasan per track), tanpa menyentuh
 * progres pengguna sama sekali.
 *
 * `idLatihan` diambil dari frontmatter, bukan dikosongkan: FR-28 menyatakan modul
 * selesai bila kuis tuntas DAN minimal satu latihan lulus. Kalau daftar ini kosong,
 * syarat latihan tidak akan pernah diperiksa.
 */

export const metadata: Metadata = {
  title: 'Progres',
  description:
    'Ringkasan kemajuan belajar: modul selesai per track, skor kuis terakhir, latihan lulus, dan checklist interview. Bisa diekspor dan diimpor untuk pindah perangkat.',
};

export default async function HalamanProgres() {
  const semua = await semuaModul();

  const daftar = semua.map((m) => ({
    track: m.frontmatter.track,
    slug: m.frontmatter.slug,
    judul: m.frontmatter.judul,
    jumlahSoal: m.frontmatter.kuis.length,
    idLatihan: m.frontmatter.latihan.map((l) => l.id),
    url: `/modul/${m.frontmatter.track}/${m.frontmatter.slug}`,
  }));

  return (
    <div className="space-y-6">
      <Progres daftar={daftar} />
    </div>
  );
}
