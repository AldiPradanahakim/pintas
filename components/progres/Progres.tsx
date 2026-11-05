'use client';

import { useState } from 'react';
import { dianggapSelesai, ringkasPerTrack } from '@/lib/progress/logika';
import { eksporProgres, imporProgres, useProgres } from '@/lib/progress/store';
import { KUNCI_PROGRES } from '@/lib/progress/schema';

export interface ModulUntukProgres {
  track: string;
  slug: string;
  judul: string;
  jumlahSoal: number;
  idLatihan: string[];
  url: string;
}

/**
 * Halaman progres (F-10). Klien penuh: datanya hanya ada di localStorage, jadi tidak ada
 * yang bisa dirender di server.
 */
export default function Progres({ daftar }: { daftar: ModulUntukProgres[] }) {
  const { progres, siap, ubah } = useProgres();
  const [pesan, setPesan] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');

  const ringkas = ringkasPerTrack(progres, daftar);
  const selesaiTotal = daftar.filter((m) => dianggapSelesai(progres, m.slug, m.jumlahSoal, m.idLatihan)).length;

  function unduh() {
    const blob = new Blob([eksporProgres()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pintas-progres-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setPesan('Progres diunduh.');
  }

  async function unggah(e: React.ChangeEvent<HTMLInputElement>) {
    const berkas = e.target.files?.[0];
    if (!berkas) return;
    const teks = await berkas.text();
    const hasil = imporProgres(teks);
    e.target.value = '';
    if (!hasil.ok) {
      setPesan(hasil.pesan);
      return;
    }
    ubah(() => hasil.progres);
    setPesan('Progres berhasil diimpor.');
  }

  function reset() {
    // FR-27: mengetik HAPUS, bukan sekadar klik.
    if (konfirmasi !== 'HAPUS') return;
    try {
      window.localStorage.removeItem(KUNCI_PROGRES);
    } catch {
      /* mode privat */
    }
    ubah(() => ({ versi: 1, modul: {}, kuis: {}, latihan: {}, interview: {} }));
    setKonfirmasi('');
    setPesan('Progres dihapus.');
  }

  if (!siap) return <p className="py-8 text-center text-sm text-slate-500">Memuat progres…</p>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Progres</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {selesaiTotal} dari {daftar.length} modul selesai. Data ini hanya ada di browser ini —
          tidak dikirim ke server. Pindah device lewat ekspor/impor di bawah.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ringkas.map((r) => (
          <div key={r.slug} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-sm font-semibold">{r.slug}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {r.selesai}/{r.total} modul selesai
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-teal-600"
                style={{ width: `${r.total ? Math.round((r.selesai / r.total) * 100) : 0}%` }}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-base font-semibold">Ekspor & impor</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Satu berkas JSON berisi semua progres: modul selesai, skor kuis, status latihan, checklist interview.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={unduh} className="rounded bg-teal-700 px-3 py-1.5 text-sm text-white">
            Ekspor progres
          </button>
          <label className="cursor-pointer rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700">
            Impor progres
            <input type="file" accept="application/json,.json" onChange={(e) => void unggah(e)} className="sr-only" />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-red-200 p-4 dark:border-red-900">
        <h2 className="text-base font-semibold text-red-700 dark:text-red-300">Hapus progres</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Ketik <code className="font-mono">HAPUS</code> untuk mengaktifkan tombol ini. Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={konfirmasi}
            onChange={(e) => setKonfirmasi(e.target.value)}
            aria-label="Ketik HAPUS untuk konfirmasi"
            className="rounded border border-slate-300 px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            placeholder="HAPUS"
          />
          <button
            type="button"
            onClick={reset}
            disabled={konfirmasi !== 'HAPUS'}
            className="rounded bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          >
            Hapus semua progres
          </button>
        </div>
      </section>

      {pesan && (
        <p role="status" className="rounded bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
          {pesan}
        </p>
      )}
    </div>
  );
}
