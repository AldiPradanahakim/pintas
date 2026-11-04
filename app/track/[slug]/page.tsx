import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { modulDariTrack } from '@/lib/content';
import { TRACKS, trackDari } from '@/content/_data/tracks';

export function generateStaticParams() {
  return TRACKS.filter((t) => t.tersedia).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const track = trackDari(slug);
  if (!track) return {};
  return { title: track.nama, description: track.kegunaan };
}

const badge = (jenis: ('web' | 'laptop')[]) => {
  if (!jenis.length) return 'Tanpa latihan';
  return jenis.map((j) => (j === 'web' ? 'Di web' : 'Di laptop')).join(' + ');
};

export default async function HalamanTrack({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const track = trackDari(slug);
  if (!track || !track.tersedia) notFound();

  const modul = await modulDariTrack(slug);
  const totalMenit = modul.reduce((a, m) => a + m.frontmatter.estimasi_menit, 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
          {track.tier === 0 ? 'Tier 0 — Fondasi' : `Tier ${track.tier}`}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{track.nama}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">{track.untukSiapa}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
          {modul.length} modul · ±{Math.round(totalMenit / 60)} jam · semua modul bisa dibuka tanpa syarat
        </p>
      </header>

      <ol className="space-y-2">
        {modul.map((m) => (
          <li key={m.frontmatter.slug}>
            <Link
              href={`/modul/${slug}/${m.frontmatter.slug}`}
              className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 hover:border-teal-500 dark:border-slate-800"
            >
              <span className="mt-0.5 w-6 shrink-0 text-sm font-semibold text-slate-400">
                {String(m.frontmatter.nomor).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{m.frontmatter.judul}</span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                  {m.frontmatter.estimasi_menit} menit · {badge([...new Set(m.frontmatter.latihan.map((l) => l.jenis))])}
                  {m.frontmatter.prasyarat.length > 0 && ` · saran: ${m.frontmatter.prasyarat.join(', ')}`}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
