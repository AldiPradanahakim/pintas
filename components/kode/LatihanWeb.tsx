'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { LatihanWeb as TipeWeb } from '@/lib/content/types';
import { catatLatihan } from '@/lib/progress/store';

/**
 * Editor dimuat terpisah (bukan diimpor langsung): CodeMirror ~250 KB, dan halaman modul
 * yang cuma dibaca tidak perlu membayarnya. NFR-02 membatasi JS halaman modul < 150 KB.
 */
const Editor = dynamic(() => import('./Editor'), {
  ssr: false,
  loading: () => (
    <div className="h-40 animate-pulse rounded border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />
  ),
});

const KUNCI_KODE = 'pintas:v1:kode:';
const KUNCI_HASIL = 'pintas:v1:latihan:';

export interface HasilUji {
  status: 'lulus' | 'gagal' | 'error';
  stdout: string;
  stderr: string;
  exit_code: number;
  durasi_ms: number;
  output_harapan: string;
  pesan: string | null;
}

/** Latihan yang boleh dilihat browser: tanpa `solusi` (diambil dari API saat diminta). */
type LatihanPublik = Omit<TipeWeb, 'solusi' | 'catatan_solusi'>;

/**
 * Latihan "Di web" (F-05): editor + tombol jalankan + hasil.
 *
 * Kode dan status terakhir disimpan di localStorage per `latihan_id` (FR-22), supaya
 * pengguna yang menutup tab tidak kehilangan pekerjaannya. Solusi TIDAK ikut di HTML
 * awal: diambil dari server hanya saat tombolnya ditekan (FR-23).
 */
export default function LatihanWeb({ latihan, nomor }: { latihan: LatihanPublik; nomor: number }) {
  const [kode, setKode] = useState(latihan.kode_awal);
  const [resetKe, setResetKe] = useState(latihan.kode_awal);
  const [hasil, setHasil] = useState<HasilUji | null>(null);
  const [jalan, setJalan] = useState(false);
  const [galat, setGalat] = useState('');
  const [solusi, setSolusi] = useState<{ kode: string; catatan: string | null } | null>(null);
  const [memuatSolusi, setMemuatSolusi] = useState(false);

  // Kode & hasil terakhir dari kunjungan sebelumnya.
  useEffect(() => {
    try {
      const kodeLama = localStorage.getItem(KUNCI_KODE + latihan.id);
      if (kodeLama !== null) {
        setKode(kodeLama);
        setResetKe(kodeLama);
      }
      const hasilLama = localStorage.getItem(KUNCI_HASIL + latihan.id);
      if (hasilLama) setHasil(JSON.parse(hasilLama) as HasilUji);
    } catch {
      // mode privat: mulai dari kode awal
    }
  }, [latihan.id]);

  useEffect(() => {
    try {
      localStorage.setItem(KUNCI_KODE + latihan.id, kode);
    } catch {
      /* mode privat */
    }
  }, [latihan.id, kode]);

  async function jalankan() {
    setJalan(true);
    setGalat('');
    try {
      const res = await fetch('/api/latihan/jalankan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latihan_id: latihan.id, bahasa: latihan.bahasa, kode }),
      });
      const json = await res.json();
      if (!json.ok) {
        setGalat(json.error?.pesan ?? 'Gagal menjalankan kode');
        return;
      }
      setHasil(json.data as HasilUji);
      // Status latihan masuk ke progres bersama (satu kunci `pintas:v1:progres`):
      // halaman /progres menghitung "modul selesai" dari sini, bukan dari kunci per latihan.
      catatLatihan(latihan.id, (json.data as HasilUji).status);
      try {
        // Salinan hasil lengkap tetap disimpan per latihan: yang ini untuk menampilkan
        // output terakhir saat halaman dibuka ulang, bukan untuk menghitung progres.
        localStorage.setItem(KUNCI_HASIL + latihan.id, JSON.stringify(json.data));
      } catch {
        /* mode privat */
      }
    } catch {
      setGalat('Tidak bisa menghubungi server. Periksa koneksi.');
    } finally {
      setJalan(false);
    }
  }

  async function lihatSolusi() {
    setMemuatSolusi(true);
    setGalat('');
    try {
      const res = await fetch(`/api/latihan/${encodeURIComponent(latihan.id)}/solusi?bahasa=${latihan.bahasa}`);
      const json = await res.json();
      if (!json.ok) {
        setGalat(json.error?.pesan ?? 'Solusi tidak tersedia');
        return;
      }
      setSolusi(json.data);
    } catch {
      setGalat('Tidak bisa menghubungi server.');
    } finally {
      setMemuatSolusi(false);
    }
  }

  const warna =
    hasil?.status === 'lulus'
      ? 'border-teal-300 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/40'
      : hasil?.status === 'gagal'
        ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
        : 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30';

  return (
    <article className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <header className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
          Latihan {nomor} · Di web · {latihan.bahasa}
        </p>
        <h3 className="mt-1 text-base font-semibold">{latihan.soal}</h3>
      </header>

      <Editor
        nilai={kode}
        resetKe={resetKe}
        bahasa={latihan.bahasa}
        gelap={typeof document !== 'undefined' && document.documentElement.classList.contains('dark')}
        onChange={setKode}
        ariaLabel={`Editor kode latihan ${nomor}`}
      />

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void jalankan()}
          disabled={jalan}
          className="rounded bg-teal-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {jalan ? 'Menjalankan…' : 'Jalankan'}
        </button>
        <button
          type="button"
          onClick={() => setResetKe(kode + ' ')}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
        >
          Kembalikan ke kode awal
        </button>
        <button
          type="button"
          onClick={() => void lihatSolusi()}
          disabled={memuatSolusi || !!solusi}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
        >
          {memuatSolusi ? 'Memuat…' : solusi ? 'Solusi ditampilkan' : 'Lihat solusi'}
        </button>
      </div>

      {galat && <p className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{galat}</p>}

      {hasil && (
        <div role="status" data-status-latihan={hasil.status} className={`mt-3 rounded border px-3 py-2 text-sm ${warna}`}>
          <p className="font-semibold" data-label-status>
            {hasil.status === 'lulus' ? 'Lulus' : hasil.status === 'gagal' ? 'Belum tepat' : 'Error'} ·{' '}
            <span className="font-normal text-slate-600 dark:text-slate-400">{hasil.durasi_ms} ms</span>
          </p>
          {hasil.stdout && (
            <>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Keluaran</p>
              <pre className="mt-0.5 overflow-x-auto rounded bg-slate-900 px-2.5 py-2 font-mono text-[13px] text-slate-100">
                {hasil.stdout}
              </pre>
            </>
          )}
          {hasil.stderr && (
            <>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Error</p>
              <pre className="mt-0.5 overflow-x-auto rounded bg-slate-900 px-2.5 py-2 font-mono text-[13px] text-red-300">
                {hasil.stderr}
              </pre>
            </>
          )}
          {hasil.status !== 'lulus' && (
            <>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Output yang diharapkan</p>
              <pre className="mt-0.5 overflow-x-auto rounded bg-slate-900 px-2.5 py-2 font-mono text-[13px] text-teal-200">
                {hasil.output_harapan}
              </pre>
            </>
          )}
          {hasil.pesan && <p className="mt-2">{hasil.pesan}</p>}
        </div>
      )}

      {solusi && (
        <div className="mt-3 rounded border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Solusi</p>
          <pre className="mt-1 overflow-x-auto rounded bg-slate-900 px-2.5 py-2 font-mono text-[13px] text-slate-100">
            {solusi.kode}
          </pre>
          {solusi.catatan && <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{solusi.catatan}</p>}
        </div>
      )}
    </article>
  );
}
