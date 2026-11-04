import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jalankanLatihan } from '@/lib/runner/gateway';
import { BAHASA, didukung } from '@/lib/runner/allowlist';
import { cariLatihanWeb } from '@/lib/content/latihan';
import { batasi, gagal, ipDari, log, tolakRateLimit } from '@/lib/api';
import { prisma } from '@/lib/db';

const MAKS_BYTES = Number(process.env.RUNNER_MAX_BYTES ?? 65_536);
const TIMEOUT_MS = Number(process.env.RUNNER_TIMEOUT_MS ?? 15_000);
const BATAS_PER_MENIT = Number(process.env.RATE_LIMIT_PER_MIN ?? 20);

const Body = z.object({
  latihan_id: z.string().regex(/^[a-z0-9-/]{1,100}$/, 'latihan_id tidak valid'),
  bahasa: z.string(),
  kode: z.string().min(1),
});

/**
 * POST /api/latihan/jalankan — satu-satunya jalan ke penyedia eksekusi (F-05).
 *
 * `output_harapan` TIDAK diambil dari body: kalau klien boleh mengirimnya, kelulusan bisa
 * dipalsukan hanya dengan mengirim output apa pun sebagai harapan. Dari body hanya dibaca
 * id latihan, bahasa, dan kode.
 */
export async function POST(req: Request) {
  const batas = batasi(`jalankan:${ipDari(req)}`, BATAS_PER_MENIT);
  if (!batas.boleh) return tolakRateLimit(batas.tungguDetik, batas.sisa);

  let mentah: unknown;
  try {
    mentah = await req.json();
  } catch {
    return gagal(400, 'VALIDASI_GAGAL', 'Body bukan JSON yang sah.');
  }

  const parsed = Body.safeParse(mentah);
  if (!parsed.success) {
    return gagal(400, 'VALIDASI_GAGAL', 'Data yang dikirim tidak sesuai.', {
      field: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
  }
  const { latihan_id, bahasa, kode } = parsed.data;

  if (!didukung(bahasa)) {
    return gagal(400, 'BAHASA_TIDAK_DIDUKUNG', `Bahasa "${bahasa}" tidak tersedia untuk latihan web.`, {
      didukung: Object.keys(BAHASA),
    });
  }

  const ukuran = Buffer.byteLength(kode, 'utf8');
  if (ukuran > MAKS_BYTES) {
    return gagal(413, 'KODE_TERLALU_BESAR', `Kode ${ukuran} byte, batas ${MAKS_BYTES} byte.`, {
      batas_byte: MAKS_BYTES,
    });
  }

  const latihan = await cariLatihanWeb(latihan_id);
  if (!latihan) {
    return gagal(404, 'LATIHAN_TIDAK_DITEMUKAN', `Latihan "${latihan_id}" tidak dikenal.`);
  }

  const hasil = await jalankanLatihan({
    bahasa,
    kode,
    outputHarapan: latihan.latihan.output_harapan,
    timeoutMs: TIMEOUT_MS,
  });

  // Log server (NFR-21): id, bahasa, ukuran, durasi, status. Isi kode TIDAK pernah dicatat.
  log({
    rute: '/api/latihan/jalankan',
    latihan_id,
    bahasa,
    ukuran_bytes: ukuran,
    durasi_ms: hasil.durasi_ms,
    status: hasil.status,
  });

  try {
    await prisma.logLatihan.create({
      data: { latihanId: latihan_id, bahasa, ukuranBytes: ukuran, durasiMs: hasil.durasi_ms, status: hasil.status },
    });
  } catch {
    // Gagal menulis log tidak boleh menggagalkan eksekusi yang sudah berhasil.
  }

  // Penyedia tidak bisa dihubungi / timeout: beda dari "kode salah".
  if (hasil.status === 'error' && hasil.exit_code === -1) {
    return gagal(502, 'RUNNER_GAGAL', hasil.stderr);
  }

  return NextResponse.json({ ok: true, data: hasil }, { headers: { 'Cache-Control': 'no-store' } });
}
