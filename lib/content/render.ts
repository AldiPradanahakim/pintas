import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema, type Options as SkemaSanitize } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import rehypeShiki from '@shikijs/rehype';
import type { Element, Root } from 'hast';

/** Label bahasa untuk ditampilkan di kepala blok kode. */
const LABEL: Record<string, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  csharp: 'C#',
  go: 'Go',
  php: 'PHP',
  java: 'Java',
  sql: 'SQL',
  bash: 'Terminal',
  shell: 'Terminal',
  json: 'JSON',
  yaml: 'YAML',
  text: 'Output',
};

/**
 * Bungkus setiap <pre> jadi blok berkepala: label bahasa + tombol salin.
 *
 * Tombolnya cuma `<button data-salin>`; pendengar kliknya satu, dipasang di komponen
 * klien (PenyalinKode). Tanpa itu, setiap blok kode butuh satu komponen React sendiri
 * dan halaman modul jadi penuh batas server/klien.
 */
function rehypeBlokKode() {
  return (tree: Root) => {
    const ganti = (node: Element): Element | Element[] => {
      if (node.tagName !== 'pre') return node;

      const code = node.children.find((c): c is Element => c.type === 'element' && c.tagName === 'code');
      const kelas = (code?.properties?.className as string[] | undefined) ?? [];
      const bahasa = kelas.map((k) => k.replace(/^language-/, '')).find((k) => k !== 'shiki');
      const label = LABEL[bahasa ?? ''] ?? bahasa ?? 'Output';
      const keluaran = !bahasa || bahasa === 'text';

      return {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['blok-kode', keluaran ? 'blok-output' : ''] },
        children: [
          {
            type: 'element',
            tagName: 'figcaption',
            properties: {},
            children: [
              { type: 'element', tagName: 'span', properties: {}, children: [{ type: 'text', value: label }] },
              ...(keluaran
                ? []
                : [
                    {
                      type: 'element' as const,
                      tagName: 'button',
                      properties: {
                        type: 'button',
                        className: ['salin'],
                        'data-salin': '1',
                        'aria-label': `Salin kode ${label}`,
                      },
                      children: [{ type: 'text' as const, value: 'Salin' }],
                    },
                  ]),
            ],
          },
          node,
        ],
      };
    };

    const jelajah = (node: Root | Element) => {
      const anak: (typeof node.children)[number][] = [];
      for (const c of node.children) {
        // rehype-shiki mengembalikan tree bersarang (root di dalam root), jadi 'root'
        // harus ikut ditelusuri — tipe hast tidak menyatakannya, kenyataannya ada.
        if ((c as { type: string }).type === 'root') {
          jelajah(c as unknown as Root);
          anak.push(c);
        } else if (c.type === 'element') {
          const hasil = ganti(c);
          if (Array.isArray(hasil)) {
            anak.push(...hasil);
            continue;
          }
          anak.push(hasil);
          // Sudah diganti jadi <figure>? Isinya jangan ditelusuri lagi: <pre> yang sama
          // akan dibungkus ulang tanpa henti (stack overflow saat build).
          if (hasil === c) jelajah(hasil);
        } else {
          anak.push(c);
        }
      }
      node.children = anak;
    };
    jelajah(tree);
  };
}

/**
 * Skema sanitasi: default GitHub + dua kelonggaran.
 * - `className`/`style` pada pre/span/code: dipakai shiki untuk mewarnai.
 * - `data-salin`: penanda tombol salin buatan kita sendiri.
 * HTML mentah dari berkas konten tetap dibuang (NFR-08) karena sanitize jalan lebih dulu.
 */
const skema: SkemaSanitize = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'data-salin'],
    pre: [['className'], ['style']],
    code: [['className'], ['style']],
    span: [['className'], ['style']],
    figure: [['className']],
    figcaption: [['className']],
    button: [['className'], ['type'], ['aria-label'], 'data-salin'],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), 'figure', 'figcaption', 'button'],
};

const prosesor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize, skema)
  .use(rehypeSlug)
  // Pembungkus blok kode jalan SEBELUM shiki: `class="language-python"` masih ada di
  // <code> sehingga label bahasanya bisa dibaca. Shiki sesudahnya tetap menemukan
  // `pre > code` di dalam <figure> dan mewarnainya.
  .use(rehypeBlokKode)
  .use(rehypeShiki, {
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
    fallbackLanguage: 'text',
  })
  .use(rehypeStringify);

export async function renderMarkdown(md: string): Promise<string> {
  return String(await prosesor.process(md));
}

export interface Heading {
  level: 2 | 3;
  teks: string;
  id: string;
}

/**
 * Heading level 2–3 dari markdown mentah, untuk daftar isi (FR-06).
 * Slug-nya mengikuti github-slugger yang dipakai rehype-slug: huruf kecil,
 * tanda baca dibuang, spasi → tanda hubung, duplikat diberi akhiran -1, -2.
 */
export function daftarHeading(md: string): Heading[] {
  const out: Heading[] = [];
  const terpakai = new Map<string, number>();
  let dalamBlok = false;

  for (const baris of md.split('\n')) {
    if (baris.trimStart().startsWith('```')) dalamBlok = !dalamBlok;
    if (dalamBlok) continue;
    const m = /^(#{2,3})\s+(.+)$/.exec(baris);
    if (!m) continue;

    const teks = m[2].replace(/[`*_]/g, '').trim();
    let id = teks
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-');
    const n = terpakai.get(id) ?? 0;
    terpakai.set(id, n + 1);
    if (n > 0) id = `${id}-${n}`;
    out.push({ level: m[1].length as 2 | 3, teks, id });
  }
  return out;
}

/** Teks polos dari markdown: untuk indeks pencarian dan cuplikan hasil. */
export function teksPolos(md: string): string {
  return md
    .replace(/```[^\n]*\n?/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    // Garis bawah sengaja TIDAK dibuang: nama variabel seperti `top_p` dan `max_tokens`
    // adalah hal yang dicari orang, dan menghapus `_` membuatnya tak bisa ditemukan.
    .replace(/[*`>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
