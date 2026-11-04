import { NextResponse } from 'next/server';

/** Bentuk respons seragam (docs/08-api.md § 3). */
export const ok = <T>(data: T, init?: { status?: number; cache?: string }) =>
  NextResponse.json(
    { ok: true, data },
    {
      status: init?.status ?? 200,
      headers: init?.cache ? { 'Cache-Control': init.cache } : undefined,
    },
  );

export interface ErrorApi {
  kode: string;
  pesan: string;
  detail?: Record<string, unknown> | null;
}

export const gagal = (status: number, kode: string, pesan: string, detail?: Record<string, unknown>) =>
  NextResponse.json({ ok: false, error: { kode, pesan, detail: detail ?? null } }, { status });

/**
 * Rate limit fixed-window di memori proses (docs/08-api.md § 9).
 * Cukup untuk satu instance; dicatat sebagai batasan, bukan dikerjakan sekarang.
 */
const hitungan = new Map<string, { jendela: number; jumlah: number }>();

export function batasi(kunci: string, batas: number): { boleh: boolean; tungguDetik: number; sisa: number } {
  const jendela = Math.floor(Date.now() / 60_000);
  const lama = hitungan.get(kunci);

  if (!lama || lama.jendela !== jendela) {
    hitungan.set(kunci, { jendela, jumlah: 1 });
    // Jaga peta tidak tumbuh tanpa batas: buang entri jendela lama saat peta membesar.
    if (hitungan.size > 5000) {
      for (const [k, v] of hitungan) if (v.jendela !== jendela) hitungan.delete(k);
    }
    return { boleh: true, tungguDetik: 0, sisa: batas - 1 };
  }

  lama.jumlah += 1;
  const sisa = Math.max(0, batas - lama.jumlah);
  return {
    boleh: lama.jumlah <= batas,
    tungguDetik: lama.jumlah > batas ? 60 - (Math.floor(Date.now() / 1000) % 60) : 0,
    sisa,
  };
}

/** IP klien: `x-forwarded-for` paling kiri, atau 'lokal' bila header tidak ada. */
export const ipDari = (req: Request): string =>
  (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'lokal';

export function tolakRateLimit(tungguDetik: number, sisa: number) {
  return NextResponse.json(
    {
      ok: false,
      error: { kode: 'RATE_LIMIT', pesan: `Terlalu banyak permintaan. Coba lagi dalam ${tungguDetik} detik.`, detail: { tunggu_detik: tungguDetik } },
    },
    {
      status: 429,
      headers: { 'Retry-After': String(tungguDetik), 'X-RateLimit-Remaining': String(sisa) },
    },
  );
}

/** Catat satu baris log terstruktur (NFR-21). Tidak pernah berisi isi kode pengguna. */
export function log(entri: Record<string, unknown>) {
  console.log(JSON.stringify({ waktu: new Date().toISOString(), ...entri }));
}
