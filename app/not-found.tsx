import Link from 'next/link';
import { semuaModulRingkas } from '@/lib/content';

export default async function TidakDitemukan() {
  const modul = (await semuaModulRingkas()).slice(0, 3);

  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Alamatnya mungkin salah ketik, atau modulnya sudah diganti nama.
      </p>
      <p className="mt-4">
        <Link href="/" className="text-teal-700 underline dark:text-teal-400">
          Kembali ke beranda
        </Link>
      </p>
      <div className="mt-8 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Coba modul ini</p>
        <ul className="mt-2 space-y-1">
          {modul.map((m) => (
            <li key={m.url}>
              <Link href={m.url} className="text-teal-700 underline dark:text-teal-400">
                {m.judul}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
