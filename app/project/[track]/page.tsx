import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Capstone from '@/components/project/Capstone';
import { capstoneDari, totalBobot } from '@/content/_data/capstone';
import { TRACKS, trackDari } from '@/content/_data/tracks';

/**
 * H5 — Project / capstone (PRD F-08).
 *
 * Server hanya mengirim rubrik. Tautan repo dan status review hidup di localStorage
 * pengguna (lihat components/project/Capstone.tsx) — MVP tidak punya penilaian
 * otomatis maupun penyimpanan di server.
 */

export function generateStaticParams() {
  // Hanya track yang benar-benar punya capstone. Mendaftarkan track tanpa capstone
  // akan mem-prerender halaman 404 untuk rute yang tampak sah.
  return TRACKS.filter((t) => capstoneDari(t.slug) !== null).map((t) => ({ track: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const { track } = await params;
  const capstone = capstoneDari(track);
  const t = trackDari(track);
  if (!capstone || !t) return { title: 'Project tidak ditemukan' };

  return {
    title: `Project: ${capstone.judul}`,
    description: `Capstone ${t.nama} — ${capstone.fiturWajib.length} fitur wajib, rubrik ${capstone.rubrik.length} kriteria, syarat lulus skor ≥ ${capstone.ambangLulus}%.`,
  };
}

export default async function HalamanProject({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  const capstone = capstoneDari(track);
  const t = trackDari(track);
  if (!capstone || !t) notFound();

  const bobot = totalBobot(capstone);

  return (
    <div className="space-y-6">
      <nav aria-label="Remah roti" className="text-sm text-slate-500 dark:text-slate-400">
        <Link href={`/track/${track}`} className="hover:underline">
          {t.nama}
        </Link>
        {' / '}project
      </nav>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
          Capstone · {t.nama}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{capstone.judul}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">{capstone.ringkasan}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          ±{capstone.estimasiJam} jam · {capstone.fiturWajib.length} fitur wajib ·{' '}
          {capstone.rubrik.length} kriteria rubrik · lulus bila skor ≥ {capstone.ambangLulus}%
        </p>
      </header>

      <Capstone
        track={track}
        fiturWajib={capstone.fiturWajib}
        rubrik={capstone.rubrik}
        ambangLulus={capstone.ambangLulus}
        langkah={capstone.langkah}
        fiturOpsional={capstone.fiturOpsional}
      />

      {bobot !== 100 && (
        <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Catatan untuk pengelola: total bobot rubrik {bobot}%, seharusnya 100%.
        </p>
      )}
    </div>
  );
}
