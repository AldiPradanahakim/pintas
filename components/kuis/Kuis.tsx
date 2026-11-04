'use client';

import { useState } from 'react';

export interface SoalPublik {
  id: number;
  nomor: number;
  tipe: 'pilihan_ganda' | 'isian_singkat';
  pertanyaan: string;
  opsi?: { kunci: string; teks: string }[];
}

interface HasilJawab {
  benar: boolean;
  jawaban_benar: string;
  penjelasan: string;
}

const KUNCI_SKOR = 'pintas:v1:kuis:';

/**
 * Kuis (F-07). Kunci jawaban TIDAK ada di props: server hanya mengirim pertanyaan dan
 * opsi. Penilaian dilakukan server lewat POST /api/kuis/[slug]/jawab, jadi melihat source
 * halaman tidak memberi keuntungan apa pun.
 *
 * Skor terakhir disimpan di localStorage; riwayat percobaan tidak disimpan (FR-17).
 */
export default function Kuis({ slug, soal }: { slug: string; soal: SoalPublik[] }) {
  const [jawab, setJawab] = useState<Record<number, string>>({});
  const [hasil, setHasil] = useState<Record<number, HasilJawab>>({});
  const [proses, setProses] = useState<number | null>(null);
  const [galat, setGalat] = useState('');
  const [skor, setSkor] = useState<number | null>(null);

  const terjawab = Object.keys(hasil).length;
  const benar = Object.values(hasil).filter((h) => h.benar).length;

  async function kirim(s: SoalPublik) {
    const nilai = (jawab[s.id] ?? '').trim();
    if (!nilai) return;
    setProses(s.id);
    setGalat('');
    try {
      const res = await fetch(`/api/kuis/${encodeURIComponent(slug)}/jawab`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soal_id: s.id, jawaban: nilai }),
      });
      const json = await res.json();
      if (!json.ok) {
        setGalat(json.error?.pesan ?? 'Gagal menilai jawaban');
        return;
      }
      const baru = { ...hasil, [s.id]: json.data as HasilJawab };
      setHasil(baru);

      if (Object.keys(baru).length === soal.length) {
        const jumlahBenar = Object.values(baru).filter((h) => h.benar).length;
        setSkor(jumlahBenar);
        try {
          localStorage.setItem(KUNCI_SKOR + slug, String(jumlahBenar));
        } catch {
          /* mode privat */
        }
      }
    } catch {
      setGalat('Tidak bisa menghubungi server. Periksa koneksi.');
    } finally {
      setProses(null);
    }
  }

  function ulangi() {
    setJawab({});
    setHasil({});
    setSkor(null);
    setGalat('');
  }

  return (
    <section id="kuis" className="scroll-mt-24">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">Kuis</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {terjawab}/{soal.length} dijawab
          {skor !== null && ` · skor ${skor}/${soal.length}`}
        </p>
      </div>

      <ol className="space-y-4">
        {soal.map((s) => {
          const h = hasil[s.id];
          return (
            <li key={s.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm font-medium">
                {s.nomor}. {s.pertanyaan}
              </p>

              {s.tipe === 'pilihan_ganda' ? (
                <div className="mt-2 space-y-1.5">
                  {(s.opsi ?? []).map((o) => (
                    <label key={o.kunci} className="flex cursor-pointer items-start gap-2 text-sm">
                      <input
                        type="radio"
                        name={`soal-${s.id}`}
                        value={o.kunci}
                        checked={jawab[s.id] === o.kunci}
                        disabled={!!h}
                        onChange={(e) => setJawab({ ...jawab, [s.id]: e.target.value })}
                        className="mt-1"
                      />
                      <span>
                        <span className="font-mono uppercase text-slate-500">{o.kunci}.</span> {o.teks}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={jawab[s.id] ?? ''}
                  disabled={!!h}
                  onChange={(e) => setJawab({ ...jawab, [s.id]: e.target.value })}
                  placeholder="Tulis jawaban singkat…"
                  aria-label={`Jawaban soal ${s.nomor}`}
                  className="mt-2 w-full rounded border border-slate-300 px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              )}

              {!h && (
                <button
                  type="button"
                  onClick={() => void kirim(s)}
                  disabled={proses === s.id || !(jawab[s.id] ?? '').trim()}
                  className="mt-2 rounded bg-teal-700 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                >
                  {proses === s.id ? 'Menilai…' : 'Periksa jawaban'}
                </button>
              )}

              {h && (
                <div
                  className={`mt-2 rounded px-3 py-2 text-sm ${
                    h.benar
                      ? 'bg-teal-50 text-teal-900 dark:bg-teal-950/40 dark:text-teal-200'
                      : 'bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200'
                  }`}
                >
                  <p className="font-semibold">
                    {h.benar ? 'Benar' : `Belum tepat — jawaban benar: ${h.jawaban_benar}`}
                  </p>
                  <p className="mt-1">{h.penjelasan}</p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {galat && <p className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{galat}</p>}

      {skor !== null && (
        <div className="mt-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <p className="font-semibold">
            Skor {skor}/{soal.length}
          </p>
          <button type="button" onClick={ulangi} className="mt-2 rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700">
            Ulangi kuis
          </button>
        </div>
      )}

      <noscript>
        <p className="mt-2 text-sm text-slate-600">
          Penilaian kuis butuh JavaScript. Soal dan pilihan jawaban tetap bisa dibaca tanpa JavaScript.
        </p>
      </noscript>
    </section>
  );
}
