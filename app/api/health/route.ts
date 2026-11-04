import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/health — status layanan + DB. TIDAK memanggil penyedia eksekusi (agar tidak
 * menghabiskan kuota mereka); `runner` hanya melaporkan konfigurasi (docs/08-api.md § 8).
 */
export async function GET() {
  let db = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = 'gagal';
  }

  return NextResponse.json(
    {
      ok: true,
      data: {
        status: db === 'ok' ? 'sehat' : 'terganggu',
        db,
        runner: process.env.RUNNER_PROVIDER ?? 'wandbox',
        waktu: new Date().toISOString(),
      },
    },
    { headers: { 'Cache-Control': 'public, max-age=300' } },
  );
}
