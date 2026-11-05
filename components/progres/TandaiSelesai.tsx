'use client';

import { dianggapSelesai } from '@/lib/progress/logika';
import { tandaiModul, useProgres } from '@/lib/progress/store';

/**
 * Penanda modul selesai (FR-28). Otomatis bila kuis tuntas + satu latihan lulus,
 * dan pengguna tetap bisa menandai manual — misalnya untuk modul yang sudah dikuasai
 * sebelum situs ini ada.
 */
export default function TandaiSelesai({
  slug,
  jumlahSoal,
  idLatihan,
}: {
  slug: string;
  jumlahSoal: number;
  idLatihan: string[];
}) {
  const { progres, siap } = useProgres();
  if (!siap) return null;

  const selesai = dianggapSelesai(progres, slug, jumlahSoal, idLatihan);
  const manual = !!progres.modul[slug]?.manual;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800">
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          selesai
            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
        }`}
      >
        {selesai ? 'Modul selesai' : 'Belum selesai'}
      </span>
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {selesai && !manual
          ? 'Otomatis: kuis tuntas dan minimal satu latihan lulus.'
          : 'Selesai otomatis setelah kuis tuntas dan satu latihan lulus.'}
      </span>
      <button
        type="button"
        onClick={() => tandaiModul(slug, !manual)}
        className="ml-auto rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
      >
        {manual ? 'Batalkan tanda selesai' : 'Tandai selesai manual'}
      </button>
    </div>
  );
}
