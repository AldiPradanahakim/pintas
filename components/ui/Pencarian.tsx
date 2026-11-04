'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cariModul, type HasilCari } from '@/lib/search/query';
import type { EntriIndeks } from '@/lib/search/tipe';
import Highlight from './Highlight';

const RIWAYAT = 'pintas:v1:cari-riwayat';
const MAKS_CEPAT = 8;

/**
 * Panel pencarian (F-02).
 *
 * Indeks diambil SEKALI dari `/cari-indeks.json` saat panel pertama dibuka, lalu disimpan
 * di variabel modul: mengetik berikutnya tidak memicu permintaan jaringan (FR-08).
 * Berkasnya statis hasil build, jadi tidak ada server yang bekerja per ketikan.
 */
let indeksTersimpan: EntriIndeks[] | null = null;

export default function Pencarian({ buka, onTutup }: { buka: boolean; onTutup: () => void }) {
  const router = useRouter();
  const [indeks, setIndeks] = useState<EntriIndeks[] | null>(indeksTersimpan);
  const [kata, setKata] = useState('');
  const [tunda, setTunda] = useState('');
  const [track, setTrack] = useState<string | null>(null);
  const [sorot, setSorot] = useState(0);
  const [riwayat, setRiwayat] = useState<string[]>([]);
  const kotak = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!buka) return;
    setSorot(0);
    kotak.current?.focus();
    try {
      setRiwayat(JSON.parse(localStorage.getItem(RIWAYAT) ?? '[]') as string[]);
    } catch {
      setRiwayat([]);
    }
    if (indeksTersimpan) return;
    fetch('/cari-indeks.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: EntriIndeks[]) => {
        indeksTersimpan = data;
        setIndeks(data);
      })
      .catch(() => setIndeks([]));
  }, [buka]);

  // Debounce 200 ms (FR-09): satu hasil akhir, bukan hasil yang berubah tiap huruf.
  useEffect(() => {
    const t = setTimeout(() => setTunda(kata), 200);
    return () => clearTimeout(t);
  }, [kata]);

  const hasil = useMemo(
    () => (indeks ? cariModul(indeks, tunda, { track, batas: MAKS_CEPAT }) : []),
    [indeks, tunda, track],
  );
  const daftarTrack = useMemo(() => (indeks ? [...new Set(indeks.map((i) => i.track))] : []), [indeks]);

  function simpanRiwayat(q: string) {
    const bersih = q.trim();
    if (!bersih) return;
    const baru = [bersih, ...riwayat.filter((r) => r !== bersih)].slice(0, 5);
    setRiwayat(baru);
    try {
      localStorage.setItem(RIWAYAT, JSON.stringify(baru));
    } catch {
      // mode privat: riwayat tidak tersimpan, pencarian tetap jalan
    }
  }

  function bukaHasil(h: HasilCari) {
    simpanRiwayat(kata);
    onTutup();
    router.push(h.url);
  }

  function semuaHasil() {
    simpanRiwayat(kata);
    onTutup();
    router.push(`/cari?q=${encodeURIComponent(kata.trim())}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onTutup();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSorot((s) => Math.min(s + 1, Math.max(hasil.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSorot((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const h = hasil[sorot];
      if (h) bukaHasil(h);
      else if (kata.trim()) semuaHasil();
    }
  }

  if (!buka) return null;

  const kosong = tunda.trim().length >= 2 && hasil.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onTutup();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 dark:border-slate-700">
          <input
            ref={kotak}
            value={kata}
            onChange={(e) => setKata(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Cari modul, bagian, atau kata di dalam kode…"
            aria-label="Kata kunci pencarian"
            className="w-full bg-transparent py-3 text-base outline-none"
          />
          <kbd className="rounded border border-slate-300 px-1.5 text-xs text-slate-500 dark:border-slate-600">
            Esc
          </kbd>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setTrack(null)}
            aria-pressed={track === null}
            className={`rounded-full px-2.5 py-1 text-xs ${
              track === null
                ? 'bg-teal-700 text-white'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Semua
          </button>
          {daftarTrack.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTrack(t)}
              aria-pressed={track === t}
              className={`rounded-full px-2.5 py-1 text-xs ${
                track === t
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {hasil.map((h, i) => (
            <button
              key={h.url}
              type="button"
              onMouseEnter={() => setSorot(i)}
              onClick={() => bukaHasil(h)}
              className={`block w-full border-b border-slate-50 px-3 py-2.5 text-left dark:border-slate-800 ${
                i === sorot ? 'bg-teal-50 dark:bg-slate-800' : ''
              }`}
            >
              <p className="flex items-baseline gap-2 text-sm font-medium">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {h.track}/{String(h.nomor).padStart(2, '0')}
                </span>
                <span>
                  <Highlight teks={h.judul} kata={tunda} />
                </span>
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                <Highlight teks={h.cuplikan} kata={tunda} />
              </p>
            </button>
          ))}

          {kosong && (
            <div className="px-3 py-5">
              <p className="text-sm text-slate-700 dark:text-slate-300">Tidak ada hasil untuk «{tunda.trim()}».</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Coba modul ini</p>
              <ul className="mt-1 space-y-1">
                {(indeks ?? []).slice(0, 3).map((m) => (
                  <li key={m.url}>
                    <Link href={m.url} onClick={onTutup} className="text-sm text-teal-700 underline dark:text-teal-400">
                      {m.judul}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!kosong && tunda.trim().length < 2 && (
            <div className="px-3 py-5 text-sm text-slate-600 dark:text-slate-400">
              Ketik minimal 2 huruf. <kbd className="rounded border px-1">Enter</kbd> membuka semua hasil.
              {riwayat.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Terakhir dicari</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {riwayat.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setKata(r)}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs dark:bg-slate-800"
                      >
                        {r}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setRiwayat([]);
                        try {
                          localStorage.removeItem(RIWAYAT);
                        } catch {
                          /* mode privat */
                        }
                      }}
                      className="px-2 py-1 text-xs text-slate-500 underline"
                    >
                      Hapus riwayat
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {hasil.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-xs text-slate-500 dark:border-slate-800">
            <span>{hasil.length} hasil · ↑↓ pilih · Enter buka</span>
            <button type="button" onClick={semuaHasil} className="underline">
              Lihat semua
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
