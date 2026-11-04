import { NextResponse } from 'next/server';
import { z } from 'zod';
import { nilaiSoal } from '@/lib/quiz/service';
import { batasi, gagal, ipDari, tolakRateLimit } from '@/lib/api';

const POLA_SLUG = /^[a-z0-9-]{1,100}$/;

const Body = z.object({
  soal_id: z.number().int().positive(),
  jawaban: z.string().trim().min(1).max(500),
});

/** POST /api/kuis/{slug}/jawab — penilaian di server (docs/08-api.md § 5). */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const batas = batasi(`jawab:${ipDari(req)}`, 20);
  if (!batas.boleh) return tolakRateLimit(batas.tungguDetik, batas.sisa);

  const { slug } = await params;
  if (!POLA_SLUG.test(slug)) {
    return gagal(400, 'SLUG_TIDAK_VALID', 'Slug modul tidak valid.');
  }

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

  try {
    const hasil = await nilaiSoal(slug, parsed.data.soal_id, parsed.data.jawaban);
    if (!hasil) {
      return gagal(404, 'SOAL_TIDAK_DITEMUKAN', 'Soal itu tidak ada untuk modul ini.');
    }
    return NextResponse.json({ ok: true, data: hasil }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return gagal(500, 'DB_GAGAL', 'Gagal menilai jawaban.');
  }
}
