import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import DaftarIsi from '@/components/modul/DaftarIsi';
import PenyalinKode from '@/components/kode/PenyalinKode';
import LatihanWeb from '@/components/kode/LatihanWeb';
import LatihanLaptop from '@/components/kode/LatihanLaptop';
import Kuis from '@/components/kuis/Kuis';
import { semuaModul, renderModul } from '@/lib/content';
import { soalPublik } from '@/lib/quiz/service';

export async function generateStaticParams() {
  return (await semuaModul()).map((m) => ({ track: m.frontmatter.track, slug: m.frontmatter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string; slug: string }>;
}): Promise<Metadata> {
  const { track, slug } = await params;
  const data = await renderModul(track, slug);
  if (!data) return {};
  return {
    title: data.modul.frontmatter.judul,
    description: `Modul ${data.modul.frontmatter.judul} — ${data.modul.frontmatter.estimasi_menit} menit, ${data.modul.frontmatter.kuis.length} soal kuis.`,
  };
}

/**
 * Soal diambil dari DB saat build. Kalau DB belum di-seed, halaman tetap harus tampil —
 * materi tidak boleh ikut mati hanya karena kuis belum siap — jadi kegagalannya ditangkap
 * dan kuis diganti catatan.
 */
async function ambilSoal(slug: string) {
  try {
    return await soalPublik(slug);
  } catch {
    return null;
  }
}

export default async function HalamanModul({
  params,
}: {
  params: Promise<{ track: string; slug: string }>;
}) {
  const { track, slug } = await params;
  const data = await renderModul(track, slug);
  if (!data) notFound();

  const { modul, htmlLapis1, htmlLapis2, toc, tocLapis2, sebelumnya, berikutnya } = data;
  const fm = modul.frontmatter;
  const soal = await ambilSoal(slug);
  const latihanWeb = fm.latihan.filter((l) => l.jenis === 'web');
  const latihanLaptop = fm.latihan.filter((l) => l.jenis === 'laptop');

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
      <article className="min-w-0">
        <PenyalinKode />

        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
            {fm.track} · modul {String(fm.nomor).padStart(2, '0')}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{fm.judul}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {fm.estimasi_menit} menit · {fm.kuis.length} soal kuis ·{' '}
            {fm.latihan.map((l) => (l.jenis === 'web' ? 'latihan web' : 'latihan laptop')).join(', ')}
          </p>
          {fm.prasyarat.length > 0 && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Saran dibaca dulu:{' '}
              {fm.prasyarat.map((p, i) => (
                <span key={p}>
                  {i > 0 && ', '}
                  <Link href={`/modul/${p}`} className="text-teal-700 underline dark:text-teal-400">
                    {p.split('/').pop()}
                  </Link>
                </span>
              ))}
              <span className="text-slate-500"> (saran, bukan syarat)</span>
            </p>
          )}
        </header>

        {/* Isi markdown: sudah disanitasi saat build, jadi aman dirender sebagai HTML. */}
        <div className="modul" dangerouslySetInnerHTML={{ __html: htmlLapis1 }} />

        <details id="lapis-2" className="mt-8 scroll-mt-24 rounded-lg border border-slate-200 dark:border-slate-800">
          <summary className="cursor-pointer px-4 py-3 font-semibold">
            Lapis 2 — detail penuh
            <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
              {tocLapis2.length} bagian
            </span>
          </summary>
          <div className="border-t border-slate-200 px-4 py-2 dark:border-slate-800">
            <div className="modul" dangerouslySetInnerHTML={{ __html: htmlLapis2 }} />
          </div>
        </details>

        {fm.latihan.length > 0 && (
          <section id="latihan" className="mt-10 scroll-mt-24 space-y-4">
            <h2 className="text-xl font-semibold">Latihan</h2>
            {latihanWeb.map((l, i) => (
              <LatihanWeb key={l.id} latihan={l} nomor={i + 1} />
            ))}
            {latihanLaptop.map((l, i) => (
              <LatihanLaptop key={l.id} latihan={l} nomor={latihanWeb.length + i + 1} />
            ))}
          </section>
        )}

        <div className="mt-10">
          {soal && soal.length > 0 ? (
            <Kuis slug={slug} soal={soal} />
          ) : (
            <section id="kuis" className="scroll-mt-24 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/30">
              Kuis belum tersedia. Jalankan <code>npm run db:seed</code> lalu build ulang.
            </section>
          )}
        </div>

        <nav className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          {sebelumnya ? (
            <Link href={sebelumnya.url} className="text-sm text-teal-700 underline dark:text-teal-400">
              ← {sebelumnya.judul}
            </Link>
          ) : (
            <span />
          )}
          {berikutnya ? (
            <Link href={berikutnya.url} className="text-sm text-teal-700 underline dark:text-teal-400">
              {berikutnya.judul} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>

      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <DaftarIsi toc={toc} tocLapis2={tocLapis2} adaLatihan={fm.latihan.length > 0} adaKuis={fm.kuis.length > 0} />
        </div>
      </aside>
    </div>
  );
}
