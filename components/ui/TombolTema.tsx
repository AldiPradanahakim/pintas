'use client';

import { useEffect, useState } from 'react';

const KUNCI = 'pintas:v1:tema';

/**
 * Tombol tema. Status awal dibaca dari kelas yang SUDAH diset skrip <head> — bukan
 * dihitung ulang dari media query — supaya ikon tidak berkedip salah di render pertama.
 */
export default function TombolTema() {
  const [gelap, setGelap] = useState(false);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setGelap(document.documentElement.classList.contains('dark'));
    setSiap(true);
  }, []);

  function ubah() {
    const baru = !gelap;
    setGelap(baru);
    document.documentElement.classList.toggle('dark', baru);
    try {
      localStorage.setItem(KUNCI, baru ? 'gelap' : 'terang');
    } catch {
      // localStorage bisa diblokir (mode privat); tema tetap berlaku untuk sesi ini.
    }
  }

  return (
    <button
      type="button"
      onClick={ubah}
      aria-label={gelap ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      aria-pressed={gelap}
      className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm hover:border-slate-400 dark:border-slate-700"
    >
      {/* Sebelum JS siap, ikon netral: menebak akan berkedip. */}
      <span aria-hidden="true">{siap ? (gelap ? '\u2600' : '\u263e') : '\u25d0'}</span>
    </button>
  );
}
