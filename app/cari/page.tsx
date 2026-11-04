import Link from 'next/link';
import type { Metadata } from 'next';
import { cariModul } from '@/lib/search/query';
import { entriIndeks } from '@/lib/content';
import Highlight from '@/components/ui/Highlight';

export const metadata: Metadata = { title: 'Hasil pencarian' };

const PER_HALAMAN = 20;

/**
 * Halaman hasil pencarian penuh (FR-13). Dijalankan di server saat build untuk query yang
 * dikenal, dan di klien untuk query bebas — hasilnya sama karena memakai fungsi yang sama
 * dengan panel Ctrl+K.
 */
export default async function HalamanCari({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; halaman?: string }>;
}) {
  const { q = '', halaman } = await searchParams;
  const kata = q.trim();
  const indeks = await entriIndeks();
  const semua = kata.length >= 2 ? cariModul(indeks, kata, { batas: 500 }) : [];

  const perHalaman = Math.max(1, Number(halaman) || 1);
  const mulai = (perHalaman - 1) * PER_HALAMAN;
  const tampil = semua.slice(mulai, mulai + PER_HALAMAN);
  const totalHalaman = Math.max(1, Math.ceil(semua.length / PER_HALAMAN));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold">
        {kata ? (
          <>
            Hasil untuk «{kata}» <span className="text-sm font-normal text-slate-500">({semua.length})</span>
          </>
        ) : (
          'Pencarian'
        )}
      </h1>

      {!kata && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Tekan <kbd className="rounded border px-1">Ctrl K</kbd> di mana saja untuk mencari, atau tulis kata
          kunci di kotak pencarian.
        </p>
      )}

      {kata && semua.length === 0 && (
        <div className="mt-4">
          <p className="text-sm">Tidak ada hasil untuk «{kata}».</p>
          <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Coba modul ini</p>
          <ul className="mt-1 space-y-1">
            {indeks.slice(0, 3).map((m) => (
              <li key={m.url}>
                <Link href={m.url} className="text-teal-700 underline dark:text-teal-400">
                  {m.judul}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {tampil.map((h) => (
          <li key={h.url} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <Link href={h.url} className="font-medium text-teal-800 underline dark:text-teal-400">
              <Highlight teks={h.judul} kata={kata} />
            </Link>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              <Highlight teks={h.cuplikan} kata={kata} />
            </p>
            <p className="mt-1 text-xs text-slate-500">{h.track}</p>
          </li>
        ))}
      </ul>

      {totalHalaman > 1 && (
        <nav className="mt-6 flex items-center gap-3 text-sm" aria-label="Halaman hasil">
          {perHalaman > 1 && (
            <Link href={`/cari?q=${encodeURIComponent(kata)}&halaman=${perHalaman - 1}`} className="underline">
              ← Sebelumnya
            </Link>
          )}
          <span className="text-slate-500">
            Halaman {perHalaman} dari {totalHalaman}
          </span>
          {perHalaman < totalHalaman && (
            <Link href={`/cari?q=${encodeURIComponent(kata)}&halaman=${perHalaman + 1}`} className="underline">
              Berikutnya →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
