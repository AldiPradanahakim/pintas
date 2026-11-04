import KartuTrack from '@/components/ui/KartuTrack';
import { NAMA_TIER, TRACKS, type Track } from '@/content/_data/tracks';
import { semuaModulRingkas } from '@/lib/content';

export default async function Beranda() {
  const modul = await semuaModulRingkas();

  // Jumlah modul & jam dihitung dari konten, bukan ditulis di data track: kartu tidak
  // pernah berbohong saat modul ditambah atau dihapus.
  const perTrack = (slug: string) => {
    const isi = modul.filter((m) => m.track === slug);
    return { jumlah: isi.length, menit: isi.reduce((a, m) => a + m.estimasi_menit, 0) };
  };

  const tier = ([0, 1, 2, 3] as Track['tier'][]).map((t) => ({
    tier: t,
    nama: NAMA_TIER[t],
    track: TRACKS.filter((x) => x.tier === t),
  }));

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Belajar satu stack sampai ke detail terkecil
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          Setiap modul punya dua lapis: ringkasan 10 menit yang bisa langsung dipraktikkan, dan detail
          penuh — semua parameter, alasan desain, dan daftar error beserta cara memperbaikinya.
        </p>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-500">
          Tidak ada urutan wajib. Tekan <kbd className="rounded border border-slate-300 px-1 dark:border-slate-600">Ctrl K</kbd>{' '}
          untuk mencari.
        </p>
      </section>

      {tier.map(({ tier: t, nama, track }) => (
        <section key={t} aria-labelledby={`tier-${t}`}>
          <h2 id={`tier-${t}`} className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {nama}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {track.map((tr) => {
              const { jumlah, menit } = perTrack(tr.slug);
              return <KartuTrack key={tr.slug} track={tr} jumlahModul={jumlah} totalMenit={menit} />;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
