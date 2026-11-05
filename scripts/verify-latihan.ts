/**
 * Jalankan SOLUSI setiap latihan web ke Wandbox lewat API aplikasi.
 *
 * Kalau solusi resmi tidak lulus, latihannya rusak: pengguna yang menyalin jawaban benar
 * tetap akan melihat "gagal". Ini yang paling sering lolos dari mata manusia.
 *
 * Solusi dibaca dari DB (hasil seed), BUKAN lewat endpoint solusi: endpoint itu dibatasi
 * 10 permintaan/menit, jadi menguji 30 latihan lewat sana selalu kena 429 — dan yang
 * diuji di sini adalah runner, bukan rate limit.
 *
 * Jalankan: npx tsx scripts/verify-latihan.ts   (server hidup di BASE_URL)
 */
import { prisma } from '../lib/db';
import { semuaModul } from '../lib/content/index';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const JEDA_MS = 3500; // di bawah 20 permintaan/menit ke /api/latihan/jalankan

const tidur = (ms: number) => new Promise((r) => setTimeout(r, ms));

const semua = await semuaModul();
const web = semua.flatMap((m) =>
  m.frontmatter.latihan
    .filter((l) => l.jenis === 'web')
    .map((l) => ({ id: l.id, bahasa: l.bahasa, modul: `${m.frontmatter.track}/${m.frontmatter.slug}` })),
);

interface Hasil {
  id: string;
  bahasa: string;
  modul: string;
  status: string;
  stdout: string | null;
  harapan: string | null;
}

const hasil: Hasil[] = [];
for (const k of web) {
  const solusi = await prisma.solusi.findUnique({
    where: { latihanId_bahasa: { latihanId: k.id, bahasa: k.bahasa } },
  });
  if (!solusi) {
    hasil.push({ ...k, status: 'SOLUSI_TIDAK_ADA_DI_DB', stdout: null, harapan: null });
    continue;
  }

  const res = await fetch(`${BASE}/api/latihan/jalankan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latihan_id: k.id, bahasa: k.bahasa, kode: solusi.kode }),
  });
  const j = (await res.json()) as {
    ok: boolean;
    data?: { status: string; stdout: string; output_harapan: string };
    error?: { kode: string; pesan: string };
  };

  hasil.push({
    ...k,
    status: j.ok ? j.data!.status : `HTTP ${res.status} ${j.error?.kode ?? ''}`,
    stdout: j.ok ? j.data!.stdout.trim() : null,
    harapan: j.ok ? j.data!.output_harapan.trim() : null,
  });
  await tidur(JEDA_MS);
}

const gagal = hasil.filter((h) => h.status !== 'lulus');
console.log(`Latihan web: ${hasil.length} · lulus: ${hasil.length - gagal.length} · gagal: ${gagal.length}`);
for (const g of gagal) {
  console.log(`  GAGAL ${g.id} (${g.bahasa}) di ${g.modul} · ${g.status}`);
  console.log(`    stdout : ${JSON.stringify(g.stdout)}`);
  console.log(`    harapan: ${JSON.stringify(g.harapan)}`);
}
await prisma.$disconnect();
process.exitCode = gagal.length ? 1 : 0;
