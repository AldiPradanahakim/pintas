'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Halaman error (NFR-15): kegagalan server menampilkan pesan ramah dengan jalan
 * keluar, BUKAN stack trace. Stack trace membocorkan struktur internal dan tidak
 * berguna bagi pembaca.
 *
 * Detail teknis tetap dicatat: di produksi Next.js menulisnya ke log server;
 * di development `error.digest` ditampilkan supaya bisa dicocokkan dengan log.
 */
export default function Galat({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Satu baris log untuk operator; pengguna tidak perlu melihatnya.
    console.error('Galat halaman:', error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl space-y-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
        Terjadi kesalahan
      </p>
      <h1 className="text-2xl font-bold tracking-tight">Halaman ini gagal dimuat</h1>
      <p className="text-slate-600 dark:text-slate-400">
        Bukan salah Anda. Coba muat ulang halaman ini; kalau masih gagal, kembali ke
        beranda dan pilih modul lain. Progres belajar Anda tersimpan di browser ini,
        jadi tidak ada yang hilang.
      </p>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={reset}
          className="rounded bg-teal-700 px-3 py-1.5 text-sm text-white"
        >
          Coba lagi
        </button>
        <Link
          href="/"
          className="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
        >
          Ke beranda
        </Link>
        <Link
          href="/panduan"
          className="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
        >
          Panduan
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <pre className="overflow-x-auto rounded bg-slate-100 p-3 text-xs dark:bg-slate-900">
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ''}
        </pre>
      )}
    </div>
  );
}
