import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import LatihanWeb from '@/components/kode/LatihanWeb';
import LatihanLaptop from '@/components/kode/LatihanLaptop';
import { semuaModul, cariLatihan } from '@/lib/content';

/**
 * H4 — Latihan (PRD F-05/F-06, SRS FR-19..FR-24).
 *
 * Halaman latihan berdiri sendiri: satu latihan per URL, tanpa membaca seluruh modul.
 * Untuk latihan `web`, solusi dibuang dari payload (FR-23) — diambil dari
 * /api/latihan/[id]/solusi hanya saat tombolnya ditekan.
 *
 * Halaman ini tidak punya generateStaticParams: latihan laptop yang butuh panduan
 * panjang lebih baik dirender saat diminta, dan jumlah latihan tumbuh bersama konten.
 */

async function ambil(id: string) {
  const ditemukan = await cariLatihan(id);
  if (!ditemukan) return null;

  const modul = (await semuaModul()).find(
    (m) => m.frontmatter.slug === ditemukan.modulSlug,
  );
  if (!modul) return null;

  const latihan = modul.frontmatter.latihan.find((l) => l.id === id);
  if (!latihan) return null;

  return { latihan, modul };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const hasil = await ambil(id);
  if (!hasil) return { title: 'Latihan tidak ditemukan' };

  return {
    title: `Latihan: ${hasil.modul.frontmatter.judul}`,
    description: `Latihan ${hasil.latihan.jenis === 'web' ? 'di web' : 'di laptop'} untuk modul ${hasil.modul.frontmatter.judul} — track ${hasil.modul.frontmatter.track}.`,
  };
}

export default async function HalamanLatihan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hasil = await ambil(id);
  if (!hasil) notFound();

  const { latihan, modul } = hasil;
  const fm = modul.frontmatter;

  // FR-23: solusi tidak boleh ikut ke payload halaman. Buang dulu sebelum diserialisasi.
  const publik =
    latihan.jenis === 'web'
      ? (() => {
          const { solusi: _s, catatan_solusi: _c, ...sisa } = latihan;
          return sisa;
        })()
      : null;

  return (
    <div className="space-y-6">
      <nav aria-label="Remah roti" className="text-sm text-slate-500 dark:text-slate-400">
        <Link href={`/track/${fm.track}`} className="hover:underline">
          {fm.track}
        </Link>
        {' / '}
        <Link href={`/modul/${fm.track}/${fm.slug}`} className="hover:underline">
          {fm.judul}
        </Link>
        {' / '}latihan
      </nav>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
          {fm.track} · latihan {latihan.jenis === 'web' ? 'di web' : 'di laptop'}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{latihan.soal}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Dari modul{' '}
          <Link href={`/modul/${fm.track}/${fm.slug}`} className="underline">
            {fm.judul}
          </Link>
          . Kode dan status terakhir disimpan di browser ini.
        </p>
      </header>

      {publik && <LatihanWeb latihan={publik} nomor={1} />}
      {latihan.jenis === 'laptop' && <LatihanLaptop latihan={latihan} nomor={1} />}

      {fm.latihan.length > 1 && (
        <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-base font-semibold">Latihan lain di modul ini</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {fm.latihan
              .filter((l) => l.id !== latihan.id)
              .map((l) => (
                <li key={l.id}>
                  <Link href={`/latihan/${l.id}`} className="text-teal-700 underline dark:text-teal-400">
                    {l.soal}
                  </Link>{' '}
                  <span className="text-slate-500">
                    ({l.jenis === 'web' ? 'di web' : 'di laptop'})
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
