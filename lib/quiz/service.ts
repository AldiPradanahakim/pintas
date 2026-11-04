import { prisma } from '../db';
import { nilaiJawaban } from './grade';

/**
 * Lapisan domain kuis. Route handler tidak boleh menyentuh Prisma langsung
 * (docs/05-arsitektur.md § 3), dan komponen tidak boleh menyentuh route handler.
 */

export interface SoalPublik {
  id: number;
  nomor: number;
  tipe: 'pilihan_ganda' | 'isian_singkat';
  pertanyaan: string;
  opsi?: { kunci: string; teks: string }[];
}

/**
 * Soal satu modul untuk browser: TANPA `jawaban`, TANPA `penjelasan` (FR-14).
 * `select` ditulis eksplisit supaya kolom rahasia tidak ikut kalau skema bertambah.
 */
export async function soalPublik(slug: string): Promise<SoalPublik[]> {
  const baris = await prisma.soal.findMany({
    where: { modulSlug: slug },
    orderBy: { nomor: 'asc' },
    select: {
      id: true,
      nomor: true,
      tipe: true,
      pertanyaan: true,
      opsi: { orderBy: { urutan: 'asc' }, select: { kunci: true, teks: true } },
    },
  });

  return baris.map((b) => ({
    id: b.id,
    nomor: b.nomor,
    tipe: b.tipe as SoalPublik['tipe'],
    pertanyaan: b.pertanyaan,
    opsi: b.opsi.length ? b.opsi : undefined,
  }));
}

export interface HasilNilaiSoal {
  benar: boolean;
  jawaban_benar: string;
  penjelasan: string;
}

/**
 * Nilai satu jawaban di server (FR-15). `modulSlug` ikut difilter: soal milik modul lain
 * tidak bisa dinilai lewat slug yang salah.
 */
export async function nilaiSoal(
  slug: string,
  soalId: number,
  jawaban: string,
): Promise<HasilNilaiSoal | null> {
  const soal = await prisma.soal.findFirst({
    where: { id: soalId, modulSlug: slug },
    select: { tipe: true, jawaban: true, penjelasan: true },
  });
  if (!soal) return null;

  const { benar, jawaban_benar } = nilaiJawaban(soal, jawaban);
  return { benar, jawaban_benar, penjelasan: soal.penjelasan };
}
