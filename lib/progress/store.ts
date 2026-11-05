import { useCallback, useEffect, useState } from 'react';
import { KUNCI_PROGRES, PROGRES_KOSONG, SkemaEkspor, SkemaProgres, type Progres } from './schema';

/**
 * Jembatan localStorage ↔ React.
 *
 * Dibaca di dalam useEffect, bukan saat inisialisasi state: pada render server tidak ada
 * `localStorage`, dan membaca di luar effect membuat markup server dan klien berbeda.
 */
export function bacaProgres(): Progres {
  if (typeof window === 'undefined') return PROGRES_KOSONG;
  try {
    const mentah = window.localStorage.getItem(KUNCI_PROGRES);
    if (!mentah) return PROGRES_KOSONG;
    const hasil = SkemaProgres.safeParse(JSON.parse(mentah));
    // Data rusak/versi lain diperlakukan sebagai kosong, bukan dilempar: satu progres
    // rusak tidak boleh membuat seluruh situs gagal dibuka.
    return hasil.success ? hasil.data : PROGRES_KOSONG;
  } catch {
    return PROGRES_KOSONG;
  }
}

export function tulisProgres(p: Progres): void {
  try {
    window.localStorage.setItem(KUNCI_PROGRES, JSON.stringify(p));
    window.dispatchEvent(new Event('pintas-progres'));
  } catch {
    // Mode privat: progres tidak tersimpan, sisa halaman tetap jalan.
  }
}

export function useProgres() {
  const [progres, setProgres] = useState<Progres>(PROGRES_KOSONG);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setProgres(bacaProgres());
    setSiap(true);
    // Perubahan dari komponen lain (kuis, latihan) tersinkron dalam tab yang sama.
    const muat = () => setProgres(bacaProgres());
    window.addEventListener('pintas-progres', muat);
    window.addEventListener('storage', muat);
    return () => {
      window.removeEventListener('pintas-progres', muat);
      window.removeEventListener('storage', muat);
    };
  }, []);

  const ubah = useCallback((fn: (p: Progres) => Progres) => {
    const baru = fn(bacaProgres());
    tulisProgres(baru);
    setProgres(baru);
    return baru;
  }, []);

  return { progres, siap, ubah };
}

/** Catat status latihan; hanya `lulus` yang menaikkan, tapi semua status dicatat. */
export function catatLatihan(id: string, status: 'lulus' | 'gagal' | 'error'): void {
  const p = bacaProgres();
  p.latihan[id] = { status, waktu: new Date().toISOString() };
  tulisProgres(p);
}

/** Catat skor kuis terakhir modul (bukan riwayat: FR-17). */
export function catatKuis(slug: string, skor: number, total: number): void {
  const p = bacaProgres();
  p.kuis[slug] = { skor, total, waktu: new Date().toISOString() };
  tulisProgres(p);
}

export function tandaiModul(slug: string, manual: boolean): void {
  const p = bacaProgres();
  if (manual) p.modul[slug] = { manual: true, waktu: new Date().toISOString() };
  else delete p.modul[slug];
  tulisProgres(p);
}

/**
 * Impor berkas ekspor. Validasi skema dulu; kalau lolos, isi progres DIGANTI (bukan
 * digabung) — "pindah device" berarti hasil yang sama persis, bukan campuran dua riwayat.
 */
export function imporProgres(teks: string): { ok: true; progres: Progres } | { ok: false; pesan: string } {
  let data: unknown;
  try {
    data = JSON.parse(teks);
  } catch {
    return { ok: false, pesan: 'Berkas bukan JSON yang sah.' };
  }

  const hasil = SkemaEkspor.safeParse(data);
  if (!hasil.success) {
    const rinci = hasil.error.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    return { ok: false, pesan: `Berkas progres tidak dikenali (${rinci}).` };
  }

  const { aplikasi: _a, diekspor_pada: _d, ...progres } = hasil.data;
  tulisProgres(progres);
  return { ok: true, progres };
}

export function eksporProgres(): string {
  return JSON.stringify({ ...bacaProgres(), aplikasi: 'pintas', diekspor_pada: new Date().toISOString() }, null, 2);
}
