import { z } from 'zod';

/**
 * Bentuk progres di localStorage (F-10).
 *
 * Semua state pengguna hidup di satu kunci `pintas:v1:progres` (FR-25), bukan tersebar:
 * ekspor = satu berkas, impor = satu validasi, reset = satu `removeItem`.
 * `versi` ada supaya skema bisa dimigrasi tanpa menebak isi lama.
 */
export const KUNCI_PROGRES = 'pintas:v1:progres';

const Waktu = z.string().min(1);

export const SkemaProgres = z.object({
  versi: z.literal(1),
  /** Modul yang ditandai selesai manual oleh pengguna. */
  modul: z.record(z.object({ manual: z.literal(true), waktu: Waktu })).default({}),
  /** Skor kuis terakhir per modul; `total` = jumlah soal saat itu. */
  kuis: z.record(z.object({ skor: z.number().int().min(0), total: z.number().int().min(1), waktu: Waktu })).default({}),
  /** Status latihan terakhir per `latihan_id`. */
  latihan: z.record(z.object({ status: z.enum(['lulus', 'gagal', 'error']), waktu: Waktu })).default({}),
  /** Kunci bank interview yang sudah dikuasai: `<track>:<id>`. */
  interview: z.record(z.boolean()).default({}),
});

export type Progres = z.infer<typeof SkemaProgres>;

export const PROGRES_KOSONG: Progres = { versi: 1, modul: {}, kuis: {}, latihan: {}, interview: {} };

/**
 * Berkas ekspor: skema + metadata supaya pengguna lain (atau versi nanti) tahu asalnya.
 * `impor` menolak berkas yang tidak cocok — FR-26: impor tidak valid tidak boleh merusak
 * data lama, jadi validasi dilakukan SEBELUM apa pun ditulis.
 */
export const SkemaEkspor = SkemaProgres.extend({
  aplikasi: z.literal('pintas'),
  diekspor_pada: z.string().min(1),
});

export type BerkasEkspor = z.infer<typeof SkemaEkspor>;
