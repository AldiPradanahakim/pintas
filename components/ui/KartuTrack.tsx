import Link from 'next/link';
import type { Track } from '@/content/_data/tracks';

/**
 * Kartu track di beranda (F-01).
 *
 * Track tanpa konten tetap dirender sebagai <a> tanpa href + aria-disabled: pembaca layar
 * tetap tahu ini track yang ada, tapi tidak ada tautan mati ke halaman 404.
 */
export default function KartuTrack({
  track,
  jumlahModul,
  totalMenit,
}: {
  track: Track;
  jumlahModul: number;
  totalMenit: number;
}) {
  const isi = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{track.nama}</h3>
        {!track.tersedia && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Segera
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{track.kegunaan}</p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
        {track.tersedia ? `${jumlahModul} modul · ±${Math.round(totalMenit / 60)} jam` : 'Belum ada modul'}
      </p>
    </>
  );

  const kelas =
    'block rounded-lg border border-slate-200 p-4 transition dark:border-slate-800';

  if (!track.tersedia) {
    return (
      <a aria-disabled="true" role="link" tabIndex={0} className={`${kelas} opacity-60`}>
        {isi}
      </a>
    );
  }

  return (
    <Link href={`/track/${track.slug}`} className={`${kelas} hover:border-teal-500 hover:shadow-sm`}>
      {isi}
    </Link>
  );
}
