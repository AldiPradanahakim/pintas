'use client';

import { basicSetup } from 'codemirror';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { useEffect, useRef } from 'react';
import { ekstensiBahasa } from './bahasa';

/**
 * Editor CodeMirror 6 (F-05). Ringan (~120 KB) dibanding Monaco (~2 MB).
 *
 * CodeMirror memegang DOM-nya sendiri, jadi komponen ini sengaja tidak merender <textarea>:
 * nilai dikirim keluar lewat onChange, dan nilai luar hanya dipakai saat editor dibuat
 * atau saat `resetKe` berubah. Menyalin state React → editor tiap render akan memindahkan
 * kursor setiap kali pengguna mengetik.
 */
export default function Editor({
  nilai,
  bahasa,
  gelap,
  onChange,
  resetKe,
  ariaLabel,
}: {
  nilai: string;
  bahasa: string;
  gelap: boolean;
  onChange: (kode: string) => void;
  /** Berubah = isi editor diganti (tombol "Kembalikan ke kode awal"). */
  resetKe: string;
  ariaLabel: string;
}) {
  const wadah = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const tema = useRef(new Compartment());
  const gantiOnChange = useRef(onChange);
  gantiOnChange.current = onChange;

  useEffect(() => {
    if (!wadah.current) return;
    const state = EditorState.create({
      doc: nilai,
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        ekstensiBahasa(bahasa),
        tema.current.of(gelap ? oneDark : []),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) gantiOnChange.current(u.state.doc.toString());
        }),
        EditorView.theme({ '&': { fontSize: '13px', maxHeight: '340px' } }),
      ],
    });
    const v = new EditorView({ state, parent: wadah.current });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
    // Editor dibuat sekali per bahasa: mengganti bahasa membuat state baru.
  }, [bahasa]);

  // Tema diganti lewat Compartment: isi editor & riwayat undo tetap utuh.
  useEffect(() => {
    view.current?.dispatch({ effects: tema.current.reconfigure(gelap ? oneDark : []) });
  }, [gelap]);

  // "Kembalikan ke kode awal": hanya saat nilainya benar-benar berubah dari luar.
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    if (v.state.doc.toString() === resetKe) return;
    v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: resetKe } });
  }, [resetKe]);

  return <div ref={wadah} aria-label={ariaLabel} role="textbox" aria-multiline="true" className="overflow-hidden rounded border border-slate-300 dark:border-slate-700" />;
}
