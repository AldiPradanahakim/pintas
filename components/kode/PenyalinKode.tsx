'use client';

import { useEffect } from 'react';

/**
 * Satu pendengar klik untuk SEMUA tombol "Salin" di halaman.
 *
 * Tombolnya dibuat oleh rehype (HTML statis), jadi tidak bisa diberi onClick per tombol
 * tanpa menjadikan seluruh isi modul komponen klien. Satu listener di document jauh lebih
 * murah: nol JS tambahan per blok kode.
 */
export default function PenyalinKode() {
  useEffect(() => {
    async function onClick(e: MouseEvent) {
      const tombol = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>('button[data-salin]');
      if (!tombol) return;

      const pre = tombol.closest('figure')?.querySelector('pre');
      if (!pre) return;

      // textContent, bukan innerText: baris yang terlipat tetap tersalin utuh.
      const kode = pre.textContent ?? '';
      const teksAsli = tombol.textContent;

      try {
        await navigator.clipboard.writeText(kode);
        tombol.textContent = 'Tersalin';
      } catch {
        // Clipboard API butuh HTTPS/localhost; kalau ditolak, beri tahu apa adanya.
        tombol.textContent = 'Gagal menyalin';
      }
      setTimeout(() => {
        tombol.textContent = teksAsli;
      }, 1600);
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
