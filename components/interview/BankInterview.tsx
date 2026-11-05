'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PertanyaanInterview, TingkatInterview } from '@/content/_data/interview';

/**
 * Bank interview (PRD F-09): filter teks, penanda "sudah dikuasai", jawaban di
 * `<details>`.
 *
 * Penanda dikuasai memakai kunci `pintas:v1:interview:<track>:<id>` dan ikut skema
 * progres (`interview` di lib/progress/schema.ts) supaya bisa diekspor bersama.
 * Di sini dibaca langsung karena komponennya tidak butuh seluruh mesin progres —
 * satu peta boolean, bukan seluruh state.
 */

const kunci = (track: string, id: string) => `pintas:v1:interview:${track}:${id}`;

const warnaTingkat: Record<TingkatInterview, string> = {
  dasar: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  menengah: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  lanjutan: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200',
};

export default function BankInterview({
  track,
  kelompok,
}: {
  track: string;
  kelompok: { topik: string; isi: PertanyaanInterview[] }[];
}) {
  const [cari, setCari] = useState('');
  const [dikuasai, setDikuasai] = useState<Record<string, boolean>>({});
  const [hanyaBelum, setHanyaBelum] = useState(false);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    const peta: Record<string, boolean> = {};
    try {
      for (const g of kelompok) {
        for (const q of g.isi) {
          if (window.localStorage.getItem(kunci(track, q.id)) === '1') peta[q.id] = true;
        }
      }
    } catch {
      /* mode privat: penanda tidak tersimpan, sisa halaman tetap jalan */
    }
    setDikuasai(peta);
    setSiap(true);
  }, [track, kelompok]);

  function toggle(id: string) {
    const baru = !dikuasai[id];
    setDikuasai((d) => ({ ...d, [id]: baru }));
    try {
      if (baru) window.localStorage.setItem(kunci(track, id), '1');
      else window.localStorage.removeItem(kunci(track, id));
      window.dispatchEvent(new Event('pintas-progres'));
    } catch {
      /* abaikan */
    }
  }

  const tersaring = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return kelompok
      .map((g) => ({
        topik: g.topik,
        isi: g.isi.filter((q) => {
          if (hanyaBelum && dikuasai[q.id]) return false;
          if (!kata) return true;
          return (
            q.tanya.toLowerCase().includes(kata) ||
            q.jawab.toLowerCase().includes(kata) ||
            q.topik.toLowerCase().includes(kata)
          );
        }),
      }))
      .filter((g) => g.isi.length > 0);
  }, [cari, hanyaBelum, dikuasai, kelompok]);

  const total = kelompok.reduce((a, g) => a + g.isi.length, 0);
  const sudah = Object.values(dikuasai).filter(Boolean).length;

  if (!siap) return <p className="py-6 text-sm text-slate-500">Memuat…</p>;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <label htmlFor="cari-interview" className="sr-only">
              Cari pertanyaan atau jawaban
            </label>
            <input
              id="cari-interview"
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari pertanyaan atau jawaban…"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hanyaBelum}
              onChange={(e) => setHanyaBelum(e.target.checked)}
            />
            Hanya yang belum dikuasai
          </label>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {sudah}/{total} ditandai sudah dikuasai.
        </p>
      </section>

      {tersaring.length === 0 && (
        <p className="rounded bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
          Tidak ada pertanyaan yang cocok. Coba kata lain, atau matikan filter.
        </p>
      )}

      {tersaring.map((g) => (
        <section key={g.topik}>
          <h2 className="text-lg font-semibold">{g.topik}</h2>
          <div className="mt-2 space-y-2">
            {g.isi.map((q) => (
              <details
                key={q.id}
                className="rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <summary className="flex cursor-pointer items-start gap-2 px-4 py-3">
                  <span
                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${warnaTingkat[q.tingkat]}`}
                  >
                    {q.tingkat}
                  </span>
                  <span className="font-medium">{q.tanya}</span>
                  {dikuasai[q.id] && (
                    <span className="ml-auto shrink-0 text-xs text-emerald-700 dark:text-emerald-400">
                      ✓ dikuasai
                    </span>
                  )}
                </summary>
                <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                  <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
                    {q.jawab}
                  </p>
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!dikuasai[q.id]}
                      onChange={() => toggle(q.id)}
                    />
                    Tandai sudah dikuasai
                  </label>
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
