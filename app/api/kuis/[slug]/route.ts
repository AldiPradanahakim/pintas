import { NextResponse } from 'next/server';
import { soalPublik } from '@/lib/quiz/service';
import { batasi, gagal, ipDari, tolakRateLimit } from '@/lib/api';

const POLA_SLUG = /^[a-z0-9-]{1,100}$/;

/**
 * GET /api/kuis/{slug} — soal satu modul, tanpa kunci jawaban (docs/08-api.md § 4).
 * Boleh di-cache publik: isinya memang tidak mengandung rahasia.
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const batas = batasi(`kuis:${ipDari(req)}`, 60);
  if (!batas.boleh) return tolakRateLimit(batas.tungguDetik, batas.sisa);

  const { slug } = await params;
  if (!POLA_SLUG.test(slug)) {
    return gagal(400, 'SLUG_TIDAK_VALID', 'Slug modul harus huruf kecil, angka, atau tanda hubung.');
  }

  try {
    const soal = await soalPublik(slug);
    if (!soal.length) {
      return gagal(404, 'SOAL_TIDAK_DITEMUKAN', `Modul "${slug}" belum punya soal.`);
    }
    return NextResponse.json(
      { ok: true, data: { modul_slug: slug, jumlah: soal.length, soal } },
      { headers: { 'Cache-Control': 'public, max-age=300' } },
    );
  } catch {
    return gagal(500, 'DB_GAGAL', 'Gagal membaca soal dari database.');
  }
}
