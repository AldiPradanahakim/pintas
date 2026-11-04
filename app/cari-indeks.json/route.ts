import { entriIndeks } from '@/lib/content';

/**
 * Indeks pencarian sebagai berkas statis hasil build (FR-08).
 * `force-static`: dibaca sekali saat build, tidak pernah menyentuh disk saat runtime.
 */
export const dynamic = 'force-static';

export async function GET() {
  const indeks = await entriIndeks();
  return new Response(JSON.stringify(indeks), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
