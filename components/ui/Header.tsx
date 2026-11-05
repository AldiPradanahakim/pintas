'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Pencarian from './Pencarian';
import TombolTema from './TombolTema';

/**
 * Header global: navigasi, pembuka pencarian, tombol tema.
 * Pencarian dibuka dengan Ctrl+K / Cmd+K dari mana saja (FR-11).
 */
export default function Header() {
  const [bukaCari, setBukaCari] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const diInput = target ? /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) : false;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setBukaCari(true);
      } else if (e.key === '/' && !diInput) {
        e.preventDefault();
        setBukaCari(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <Link href="/" className="text-base font-bold tracking-tight">
          Pintas
        </Link>
        <nav aria-label="Navigasi utama" className="hidden gap-1 text-sm sm:flex">
          <Link className="rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800" href="/stack">
            Stack
          </Link>
          <Link className="rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800" href="/panduan">
            Panduan
          </Link>
          <Link className="rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800" href="/progres">
            Progres
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setBukaCari(true)}
          className="ml-auto flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400"
          aria-label="Buka pencarian"
        >
          <span>Cari modul…</span>
          <kbd className="hidden rounded border border-slate-300 px-1 text-[11px] sm:inline dark:border-slate-600">
            Ctrl K
          </kbd>
        </button>
        <TombolTema />
      </div>

      <Pencarian buka={bukaCari} onTutup={() => setBukaCari(false)} />
    </header>
  );
}
