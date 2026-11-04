import { PrismaClient } from '@prisma/client';
import { loadSemuaModul } from '../lib/content/load';

const prisma = new PrismaClient();

/**
 * Isi DB dari konten: soal kuis + solusi latihan.
 *
 * Sifatnya idempoten dan MENGGANTI, bukan menambah: soal sebuah modul dihapus lalu
 * ditulis ulang dari frontmatter. Kalau menambah, mengubah nomor soal akan melanggar
 * UNIQUE(modulSlug, nomor) dan seed kedua gagal.
 *
 * Soal yatim (modul sudah dihapus dari konten) dilaporkan dan DIHAPUS, supaya tidak ada
 * sisa data yang diam-diam masih bisa dinilai server.
 */
async function main() {
  const modul = await loadSemuaModul();
  const slugKonten = new Set(modul.map((m) => m.frontmatter.slug));

  let jumlahSoal = 0;
  let jumlahSolusi = 0;

  for (const m of modul) {
    const slug = m.frontmatter.slug;

    await prisma.$transaction([
      // Opsi ikut terhapus lewat onDelete: Cascade.
      prisma.soal.deleteMany({ where: { modulSlug: slug } }),
    ]);

    for (const [i, s] of m.frontmatter.kuis.entries()) {
      await prisma.soal.create({
        data: {
          modulSlug: slug,
          nomor: i + 1,
          tipe: s.tipe,
          pertanyaan: s.pertanyaan,
          jawaban: s.jawaban,
          penjelasan: s.penjelasan,
          tingkat: s.tingkat,
          opsi:
            s.tipe === 'pilihan_ganda' && s.opsi
              ? {
                  create: Object.entries(s.opsi).map(([kunci, teks], urutan) => ({
                    kunci,
                    teks,
                    urutan,
                  })),
                }
              : undefined,
        },
      });
      jumlahSoal += 1;
    }

    for (const l of m.frontmatter.latihan) {
      if (l.jenis !== 'web') continue;
      await prisma.solusi.upsert({
        where: { latihanId_bahasa: { latihanId: l.id, bahasa: l.bahasa } },
        create: { latihanId: l.id, bahasa: l.bahasa, kode: l.solusi, catatan: l.catatan_solusi ?? null },
        update: { kode: l.solusi, catatan: l.catatan_solusi ?? null },
      });
      jumlahSolusi += 1;
    }
  }

  // Soal milik modul yang sudah tidak ada di konten.
  const semuaSoal = await prisma.soal.findMany({ select: { modulSlug: true } });
  const yatim = [...new Set(semuaSoal.map((s) => s.modulSlug))].filter((s) => !slugKonten.has(s));
  if (yatim.length) {
    const { count } = await prisma.soal.deleteMany({ where: { modulSlug: { in: yatim } } });
    console.warn(`Soal yatim dihapus (${yatim.join(', ')}): ${count} baris.`);
  }

  // Retensi log: baris lebih tua dari 30 hari dibuang saat seed (docs/06-erd.md § 3.4).
  const batas = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const { count: logLama } = await prisma.logLatihan.deleteMany({ where: { dibuatPada: { lt: batas } } });

  console.log(`Seed selesai: ${modul.length} modul, ${jumlahSoal} soal, ${jumlahSolusi} solusi, ${logLama} log lama dibuang.`);
}

main()
  .catch((e) => {
    console.error('Seed gagal:', e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
