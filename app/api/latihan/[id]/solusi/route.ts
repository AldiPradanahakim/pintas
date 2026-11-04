import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { batasi, gagal, ipDari, log, tolakRateLimit } from '@/lib/api';

/**
 * GET /api/latihan/{id}/solusi — solusi hanya keluar lewat endpoint ini (FR-23), tidak
 * pernah ikut di payload halaman. Setiap permintaan dicatat untuk melihat latihan mana
 * yang paling sering dibuka solusinya (indikasi soalnya terlalu sulit).
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const batas = batasi(`solusi:${ipDari(req)}`, 10);
  if (!batas.boleh) return tolakRateLimit(batas.tungguDetik, batas.sisa);

  const { id } = await params;
  if (!/^[a-z0-9-/]{1,100}$/.test(id)) {
    return gagal(400, 'VALIDASI_GAGAL', 'ID latihan tidak valid.');
  }

  const bahasa = new URL(req.url).searchParams.get('bahasa');

  try {
    const solusi = bahasa
      ? await prisma.solusi.findUnique({ where: { latihanId_bahasa: { latihanId: id, bahasa } } })
      : await prisma.solusi.findFirst({ where: { latihanId: id }, orderBy: { id: 'asc' } });

    if (!solusi) {
      return gagal(404, 'SOLUSI_TIDAK_ADA', 'Latihan ini tidak punya solusi tersimpan.');
    }

    log({ rute: '/api/latihan/solusi', latihan_id: id, bahasa: solusi.bahasa });
    return NextResponse.json(
      { ok: true, data: { latihan_id: id, bahasa: solusi.bahasa, kode: solusi.kode, catatan: solusi.catatan } },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return gagal(500, 'DB_GAGAL', 'Gagal membaca solusi.');
  }
}
