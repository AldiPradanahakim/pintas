import { notFound } from 'next/navigation';
import { makePage } from '@keystatic/next/ui/app';
import config from '@/keystatic.config';

/**
 * Panel admin Keystatic (SRS FR-34).
 *
 * Gerbang utama: rute ini HANYA boleh ada saat development. Di produksi, halaman
 * memanggil `notFound()` sehingga pengunjung mendapat 404 — panel admin tidak boleh
 * ikut berfungsi, karena ia punya kemampuan menulis ke folder konten.
 */
export const dynamic = 'force-dynamic';

const Page = makePage(config);

export default function HalamanKeystatic() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <Page />;
}
