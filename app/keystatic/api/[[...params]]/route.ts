import { notFound } from 'next/navigation';
import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '@/keystatic.config';

/**
 * API Keystatic (SRS FR-34) — dipakai panel admin untuk membaca/menulis konten.
 *
 * Sama seperti halaman `/keystatic`: hanya hidup saat development. Di produksi
 * seluruh handler memanggil `notFound()`, jadi tidak ada jalan menulis ke `content/`.
 */
export const dynamic = 'force-dynamic';

const { GET: GET_KS, POST: POST_KS } = makeRouteHandler({ config });

function mati() {
  if (process.env.NODE_ENV !== 'development') notFound();
}

export async function GET(request: Request) {
  mati();
  return GET_KS(request);
}

export async function POST(request: Request) {
  mati();
  return POST_KS(request);
}
