'use client';

import { useEffect, useState } from 'react';
import type { KriteriaRubrik } from '@/content/_data/capstone';

/**
 * Bagian klien halaman capstone (PRD F-08).
 *
 * Yang disimpan di browser: tautan repo dan daftar fitur wajib yang sudah dicentang.
 * Status review SELALU "belum direview" — MVP tidak punya server yang mereview, dan
 * menampilkan status lain akan menyesatkan. Review dilakukan manual lewat issue GitHub.
 *
 * Kunci localStorage memakai awalan `pintas:v1:` supaya ikut aturan FR-25 dan bisa
 * diekspor bersama progres lainnya.
 */

const kunciRepo = (track: string) => `pintas:v1:capstone:${track}`;

interface Simpanan {
  repo: string;
  fitur: string[];
}

const kosong = (): Simpanan => ({ repo: '', fitur: [] });

export default function Capstone({
  track,
  fiturWajib,
  rubrik,
  ambangLulus,
  langkah,
  fiturOpsional,
}: {
  track: string;
  fiturWajib: string[];
  rubrik: KriteriaRubrik[];
  ambangLulus: number;
  langkah: string[];
  fiturOpsional: string[];
}) {
  const [data, setData] = useState<Simpanan>(kosong());
  const [siap, setSiap] = useState(false);
  const [pesan, setPesan] = useState('');

  useEffect(() => {
    try {
      const mentah = window.localStorage.getItem(kunciRepo(track));
      if (mentah) {
        const isi = JSON.parse(mentah) as Partial<Simpanan>;
        setData({
          repo: typeof isi.repo === 'string' ? isi.repo : '',
          fitur: Array.isArray(isi.fitur) ? isi.fitur.filter((x) => typeof x === 'string') : [],
        });
      }
    } catch {
      /* data rusak diperlakukan sebagai kosong */
    }
    setSiap(true);
  }, [track]);

  function simpan(baru: Simpanan) {
    setData(baru);
    try {
      window.localStorage.setItem(kunciRepo(track), JSON.stringify(baru));
      window.dispatchEvent(new Event('pintas-progres'));
      setPesan('Tersimpan di browser ini.');
    } catch {
      setPesan('Tidak bisa menyimpan — mode privat?');
    }
  }

  function toggleFitur(nama: string) {
    const ada = data.fitur.includes(nama);
    simpan({
      ...data,
      fitur: ada ? data.fitur.filter((f) => f !== nama) : [...data.fitur, nama],
    });
  }

  function unduhRencana() {
    const isi = [
      `# Rencana capstone — ${track}`,
      '',
      '## Fitur wajib',
      ...fiturWajib.map((f) => `- [${data.fitur.includes(f) ? 'x' : ' '}] ${f}`),
      '',
      '## Rubrik',
      ...rubrik.map((r) => `- ${r.nama} (${r.bobot}%): ${r.dinilai}`),
      '',
      `Syarat lulus: semua fitur wajib + skor rubrik ≥ ${ambangLulus}%.`,
      '',
      `Repo: ${data.repo || '(belum diisi)'}`,
    ].join('\n');

    const blob = new Blob([isi], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capstone-${track}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const selesai = fiturWajib.filter((f) => data.fitur.includes(f)).length;

  if (!siap) return <p className="py-6 text-sm text-slate-500">Memuat…</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-base font-semibold">Fitur wajib</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {selesai}/{fiturWajib.length} dicentang. Semua harus ada untuk lulus — tidak ada pengecualian.
        </p>
        <ul className="mt-3 space-y-2">
          {fiturWajib.map((f) => (
            <li key={f}>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.fitur.includes(f)}
                  onChange={() => toggleFitur(f)}
                  className="mt-1"
                />
                <span>{f}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-base font-semibold">Rubrik penilaian</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="py-2 pr-3 font-semibold">Kriteria</th>
                <th className="py-2 pr-3 font-semibold">Bobot</th>
                <th className="py-2 font-semibold">Yang dinilai</th>
              </tr>
            </thead>
            <tbody>
              {rubrik.map((r) => (
                <tr key={r.nama} className="border-b border-slate-100 align-top dark:border-slate-900">
                  <td className="py-2 pr-3 font-medium">{r.nama}</td>
                  <td className="py-2 pr-3 font-mono">{r.bobot}%</td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">{r.dinilai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Syarat lulus: semua fitur wajib ada <strong>dan</strong> skor rubrik ≥ {ambangLulus}%.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-base font-semibold">Langkah pengerjaan</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
          {langkah.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ol>
      </section>

      {fiturOpsional.length > 0 && (
        <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-base font-semibold">Nilai tambah (bukan syarat)</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
            {fiturOpsional.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-base font-semibold">Tautan repo & status review</h2>
        <label htmlFor="repo" className="mt-2 block text-sm text-slate-600 dark:text-slate-400">
          URL repo GitHub (disimpan di browser ini, tidak dikirim ke mana pun)
        </label>
        <input
          id="repo"
          type="url"
          value={data.repo}
          onChange={(e) => simpan({ ...data, repo: e.target.value })}
          placeholder="https://github.com/username/capstone"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <p className="mt-2 text-sm">
          Status:{' '}
          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            belum direview
          </span>
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
          Tidak ada penilaian otomatis. Review dilakukan manual — buka issue di repo
          template dengan judul capstone dan tautan repo-mu.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={unduhRencana}
            className="rounded bg-teal-700 px-3 py-1.5 text-sm text-white"
          >
            Unduh rencana (.md)
          </button>
        </div>
        {pesan && (
          <p role="status" className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {pesan}
          </p>
        )}
      </section>
    </div>
  );
}
