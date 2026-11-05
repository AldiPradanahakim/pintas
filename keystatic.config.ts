import { config, fields, collection } from '@keystatic/core';

/**
 * Keystatic — panel admin konten (SRS FR-34).
 *
 * Aturan keras: rute `/keystatic` HANYA ada saat development. Build produksi harus
 * 404. Itu ditegakkan di `app/keystatic/[[...params]]/page.tsx` (memanggil notFound()
 * di luar NODE_ENV=development), bukan di sini — konfigurasi ini hanya bentuk editor.
 *
 * Skema field mengikuti `lib/content/types.ts` supaya konten yang ditulis lewat panel
 * tetap lolos `npm run validate:content`. Kalau skema di sana berubah, ubah di sini juga.
 */

const soal = fields.object({
  tipe: fields.select({
    label: 'Tipe soal',
    options: [
      { label: 'Pilihan ganda', value: 'pilihan_ganda' },
      { label: 'Isian singkat', value: 'isian_singkat' },
    ],
    defaultValue: 'pilihan_ganda',
  }),
  pertanyaan: fields.text({ label: 'Pertanyaan', multiline: true }),
  opsi: fields.object(
    {
      a: fields.text({ label: 'Opsi A' }),
      b: fields.text({ label: 'Opsi B' }),
      c: fields.text({ label: 'Opsi C' }),
      d: fields.text({ label: 'Opsi D' }),
    },
    { label: 'Opsi (hanya pilihan ganda)' },
  ),
  jawaban: fields.text({ label: 'Jawaban benar' }),
  penjelasan: fields.text({ label: 'Penjelasan', multiline: true }),
  tingkat: fields.select({
    label: 'Tingkat',
    options: [
      { label: 'Dasar', value: 'dasar' },
      { label: 'Menengah', value: 'menengah' },
      { label: 'Lanjutan', value: 'lanjutan' },
    ],
    defaultValue: 'dasar',
  }),
});

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Pintas' },
  },
  collections: {
    modul: collection({
      label: 'Modul',
      slugField: 'slug',
      path: 'content/*/',
      format: { contentField: 'isi' },
      entryLayout: 'content',
      schema: {
        track: fields.text({ label: 'Track (slug folder)' }),
        nomor: fields.integer({ label: 'Nomor urut' }),
        judul: fields.text({ label: 'Judul modul' }),
        slug: fields.slug({ name: { label: 'Slug' } }),
        estimasi_menit: fields.integer({ label: 'Estimasi menit', defaultValue: 10 }),
        prasyarat: fields.array(fields.text({ label: 'Prasyarat' }), {
          label: 'Prasyarat (saran, bukan syarat)',
          itemLabel: (p) => p.value,
        }),
        kuis: fields.array(soal, {
          label: 'Kuis (3–5 soal)',
          itemLabel: (p) => p.fields.pertanyaan.value.slice(0, 40),
        }),
        isi: fields.mdx({ label: 'Isi modul' }),
      },
    }),
  },
});
