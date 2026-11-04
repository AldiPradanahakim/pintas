import { z } from 'zod';

/**
 * Bentuk frontmatter modul. Satu skema dipakai tiga tempat: loader (build),
 * validator CLI, dan seed DB. Kalau berbeda, konten yang lolos build bisa gagal seed.
 */

export const TINGKAT = ['dasar', 'menengah', 'lanjutan'] as const;
export const TIPE_SOAL = ['pilihan_ganda', 'isian_singkat'] as const;

const Kunci = z.enum(['a', 'b', 'c', 'd']);

const Soal = z
  .object({
    tipe: z.enum(TIPE_SOAL),
    pertanyaan: z.string().min(5).max(1000),
    opsi: z.record(Kunci, z.string().max(300)).optional(),
    jawaban: z.string().min(1).max(500),
    penjelasan: z.string().min(1, 'penjelasan wajib ada — soal tanpa penjelasan ditolak'),
    tingkat: z.enum(TINGKAT).default('dasar'),
  })
  .superRefine((s, ctx) => {
    const opsi = s.opsi ?? {};
    const jumlah = Object.keys(opsi).length;
    if (s.tipe === 'pilihan_ganda') {
      if (jumlah < 3 || jumlah > 4) {
        ctx.addIssue({ code: 'custom', message: 'pilihan_ganda wajib punya 3–4 opsi' });
      }
      if (!Object.keys(opsi).includes(s.jawaban)) {
        ctx.addIssue({ code: 'custom', message: `jawaban "${s.jawaban}" tidak ada di daftar opsi` });
      }
    } else if (jumlah > 0) {
      ctx.addIssue({ code: 'custom', message: 'isian_singkat tidak boleh punya opsi' });
    }
  });

const LangkahLaptop = z.object({
  perintah: z.string().min(1),
  penjelasan: z.string().min(1),
});

const KalauGagal = z.object({
  error: z.string().min(1),
  arti: z.string().min(1),
  perbaikan: z.array(z.string().min(1)).min(1),
});

const LatihanWeb = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id latihan: huruf kecil, angka, tanda hubung'),
  jenis: z.literal('web'),
  bahasa: z.string().regex(/^[a-z]+$/, 'bahasa: huruf kecil'),
  soal: z.string().min(10),
  kode_awal: z.string().default(''),
  output_harapan: z.string().min(1, 'latihan web wajib punya output_harapan'),
  solusi: z.string().min(1, 'latihan web wajib punya solusi'),
  catatan_solusi: z.string().optional(),
});

const LatihanLaptop = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id latihan: huruf kecil, angka, tanda hubung'),
  jenis: z.literal('laptop'),
  soal: z.string().min(10),
  kebutuhan: z.array(z.string().min(1)).min(1, 'bagian "Yang dibutuhkan" tidak boleh kosong'),
  langkah: z.array(LangkahLaptop).min(1, 'bagian "Langkah" tidak boleh kosong'),
  hasil: z.string().min(1, 'bagian "Hasil yang harus muncul" tidak boleh kosong'),
  cek_berhasil: z.array(z.string().min(1)).min(1, 'bagian "Cek berhasil" tidak boleh kosong'),
  kalau_gagal: z.array(KalauGagal).min(3, 'bagian "Kalau gagal" wajib memuat minimal 3 error nyata'),
  buktikan: z.object({ perubahan: z.string().min(1), hasil_diharapkan: z.string().min(1) }),
});

export const Latihan = z.discriminatedUnion('jenis', [LatihanWeb, LatihanLaptop]);

export const Frontmatter = z
  .object({
    track: z.string().regex(/^[a-z0-9-]+$/, 'track: huruf kecil, angka, tanda hubung'),
    nomor: z.number().int().positive(),
    judul: z.string().min(5),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'slug: huruf kecil, angka, tanda hubung'),
    estimasi_menit: z.number().int().positive().max(120),
    prasyarat: z.array(z.string()).default([]),
    latihan: z.array(Latihan).min(1, 'modul wajib punya minimal satu latihan'),
    kuis: z.array(Soal).min(3, 'kuis wajib 3–5 soal').max(5, 'kuis maksimal 5 soal'),
  })
  .strict();

export type Frontmatter = z.infer<typeof Frontmatter>;
export type Latihan = z.infer<typeof Latihan>;
export type LatihanWeb = z.infer<typeof LatihanWeb>;
export type LatihanLaptop = z.infer<typeof LatihanLaptop>;
export type SoalFrontmatter = z.infer<typeof Soal>;
export type Tingkat = (typeof TINGKAT)[number];

/** Satu modul yang sudah dibaca dari disk. */
export interface Modul {
  /** Path relatif untuk pesan error, mis. `ai-llm/01-apa-itu-llm.md`. */
  berkas: string;
  frontmatter: Frontmatter;
  /** Badan markdown tanpa frontmatter. */
  isi: string;
}

/** Bentuk ringkas untuk daftar/navigasi — tanpa isi markdown. */
export interface ModulRingkas {
  track: string;
  slug: string;
  nomor: number;
  judul: string;
  estimasi_menit: number;
  prasyarat: string[];
  jenisLatihan: ('web' | 'laptop')[];
  jumlahSoal: number;
  url: string;
}

export const TANDA_LAPIS2 = '## Lapis 2';
