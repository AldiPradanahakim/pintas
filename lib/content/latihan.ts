import { semuaModul } from './index';
import type { Latihan, LatihanWeb } from './types';

/**
 * Cari satu latihan berdasarkan `latihan_id` di seluruh konten.
 *
 * Dipakai route handler: `output_harapan` HARUS dibaca dari sini (server), bukan dari
 * body permintaan. Kalau klien yang mengirim harapannya, kelulusan bisa dipalsukan hanya
 * dengan mengirim output apa pun sebagai harapan.
 */
export async function cariLatihan(
  id: string,
): Promise<{ latihan: Latihan; modulSlug: string; track: string } | null> {
  for (const m of await semuaModul()) {
    const latihan = m.frontmatter.latihan.find((l) => l.id === id);
    if (latihan) return { latihan, modulSlug: m.frontmatter.slug, track: m.frontmatter.track };
  }
  return null;
}

/** Latihan web saja — yang punya output harapan dan bisa dijalankan. */
export async function cariLatihanWeb(
  id: string,
): Promise<{ latihan: LatihanWeb; modulSlug: string } | null> {
  const found = await cariLatihan(id);
  if (!found || found.latihan.jenis !== 'web') return null;
  return { latihan: found.latihan, modulSlug: found.modulSlug };
}
