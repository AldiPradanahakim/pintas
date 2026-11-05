import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BankInterview from '@/components/interview/BankInterview';
import { interviewDari, kelompokTopik } from '@/content/_data/interview';
import { TRACKS, trackDari } from '@/content/_data/tracks';

/**
 * H6 — Bank tanya jawab interview (PRD F-09).
 *
 * Jawaban dirender di balik `<details>` supaya pembaca bisa mencoba menjawab lebih
 * dulu; isinya memang ikut ke HTML (berbeda dengan kunci kuis) karena tujuannya
 * belajar, bukan menilai.
 *
 * Halaman ini hanya untuk track yang punya bank soal. Track tanpa bank soal 404,
 * bukan halaman kosong — halaman kosong lebih membingungkan daripada tidak ada.
 */

export function generateStaticParams() {
  return TRACKS.filter((t) => interviewDari(t.slug).length > 0).map((t) => ({ track: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const { track } = await params;
  const daftar = interviewDari(track);
  const t = trackDari(track);
  if (!daftar.length || !t) return { title: 'Interview tidak ditemukan' };

  return {
    title: `Interview: ${t.nama}`,
    description: `${daftar.length} pertanyaan interview ${t.nama}, dikelompokkan per topik dengan tingkat dasar, menengah, dan lanjutan.`,
  };
}

export default async function HalamanInterview({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  const daftar = interviewDari(track);
  const t = trackDari(track);
  if (!daftar.length || !t) notFound();

  const kelompok = kelompokTopik(daftar);
  const jumlah = {
    dasar: daftar.filter((q) => q.tingkat === 'dasar').length,
    menengah: daftar.filter((q) => q.tingkat === 'menengah').length,
    lanjutan: daftar.filter((q) => q.tingkat === 'lanjutan').length,
  };

  return (
    <div className="space-y-6">
      <nav aria-label="Remah roti" className="text-sm text-slate-500 dark:text-slate-400">
        <Link href={`/track/${track}`} className="hover:underline">
          {t.nama}
        </Link>
        {' / '}interview
      </nav>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
          Bank interview · {t.nama}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Tanya jawab interview</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          {daftar.length} pertanyaan dalam {kelompok.length} topik — {jumlah.dasar} dasar,{' '}
          {jumlah.menengah} menengah, {jumlah.lanjutan} lanjutan. Coba jawab sendiri dulu
          sebelum membuka jawabannya.
        </p>
      </header>

      <BankInterview track={track} kelompok={kelompok} />
    </div>
  );
}
