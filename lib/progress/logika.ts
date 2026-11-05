import type { Progres } from './schema';

/**
 * Aturan kelulusan modul (FR-28), fungsi murni supaya bisa diuji tanpa browser:
 * selesai bila ditandai manual, ATAU semua soal kuis sudah dijawab (skor tercatat dengan
 * `total` sama dengan jumlah soal sekarang) DAN minimal satu latihan modul itu lulus.
 *
 * `total` dibandingkan dengan jumlah soal SEKARANG, bukan disimpan sebagai "selesai":
 * kalau modul dapat soal baru, modul yang dulu selesai kembali berstatus belum — itu
 * memang yang diinginkan (materi berubah, penilaiannya harus diulang).
 */
export function dianggapSelesai(
  progres: Progres,
  slug: string,
  jumlahSoal: number,
  idLatihan: string[],
): boolean {
  if (progres.modul[slug]?.manual) return true;

  const kuis = progres.kuis[slug];
  const kuisTuntas = !!kuis && kuis.total === jumlahSoal;
  // Modul tanpa latihan web juga harus bisa selesai: cukup kuisnya tuntas.
  const latihanLulus = idLatihan.length === 0 || idLatihan.some((id) => progres.latihan[id]?.status === 'lulus');

  return kuisTuntas && latihanLulus;
}

export interface RingkasTrack {
  slug: string;
  total: number;
  selesai: number;
}

/** Hitungan ringkas per track untuk halaman progres & kartu beranda. */
export function ringkasPerTrack(
  progres: Progres,
  daftar: { track: string; slug: string; jumlahSoal: number; idLatihan: string[] }[],
): RingkasTrack[] {
  const peta = new Map<string, RingkasTrack>();
  for (const m of daftar) {
    const r = peta.get(m.track) ?? { slug: m.track, total: 0, selesai: 0 };
    r.total += 1;
    if (dianggapSelesai(progres, m.slug, m.jumlahSoal, m.idLatihan)) r.selesai += 1;
    peta.set(m.track, r);
  }
  return [...peta.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}
