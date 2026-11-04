import type { LatihanLaptop as TipeLaptop } from '@/lib/content/types';

/**
 * Latihan "Di laptop" (F-06): panduan enam bagian baku, urutannya tetap.
 * Tidak ada state dan tidak ada JS: semuanya teks + perintah yang bisa disalin.
 */
export default function LatihanLaptop({ latihan, nomor }: { latihan: TipeLaptop; nomor: number }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <header className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Latihan {nomor} · Di laptop
        </p>
        <h3 className="mt-1 text-base font-semibold">{latihan.soal}</h3>
      </header>

      <section className="mt-4">
        <h4 className="text-sm font-semibold">1. Yang dibutuhkan</h4>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
          {latihan.kebutuhan.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </section>

      <section className="mt-4">
        <h4 className="text-sm font-semibold">2. Langkah</h4>
        <ol className="mt-1 space-y-2">
          {latihan.langkah.map((l, i) => (
            <li key={l.perintah} className="text-sm">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-slate-500">{i + 1}.</span>
                <div className="min-w-0 flex-1">
                  <code className="block overflow-x-auto rounded bg-slate-900 px-2.5 py-1.5 font-mono text-[13px] text-slate-100">
                    {l.perintah}
                  </code>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">{l.penjelasan}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-4">
        <h4 className="text-sm font-semibold">3. Hasil yang harus muncul</h4>
        <pre className="mt-1 overflow-x-auto rounded bg-slate-900 px-2.5 py-2 font-mono text-[13px] text-slate-100">
          {latihan.hasil.trim()}
        </pre>
      </section>

      <section className="mt-4">
        <h4 className="text-sm font-semibold">4. Cek berhasil</h4>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
          {latihan.cek_berhasil.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section className="mt-4">
        <h4 className="text-sm font-semibold">5. Kalau gagal</h4>
        <div className="mt-1 space-y-2">
          {latihan.kalau_gagal.map((g) => (
            <details key={g.error} className="rounded border border-slate-200 px-3 py-2 dark:border-slate-800">
              <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-400">
                {g.error}
              </summary>
              <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300">{g.arti}</p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
                {g.perbaikan.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded bg-teal-50 p-3 dark:bg-teal-950/40">
        <h4 className="text-sm font-semibold">6. Buktikan kamu paham</h4>
        <p className="mt-1 text-sm">
          {latihan.buktikan.perubahan}{' '}
          <span className="text-slate-600 dark:text-slate-400">
            Hasil yang diharapkan: {latihan.buktikan.hasil_diharapkan}
          </span>
        </p>
      </section>
    </article>
  );
}
