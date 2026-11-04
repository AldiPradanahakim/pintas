/**
 * Cek cepat logika yang tidak butuh DB/jaringan: normalisasi jawaban, normalisasi output,
 * slug heading, dan sanitasi markdown. Dijalankan `npm test`.
 *
 * Sengaja assert biasa, bukan kerangka test: yang perlu dibuktikan hanya beberapa aturan
 * yang mudah rusak diam-diam.
 */
import assert from 'node:assert/strict';
import { normalisasiIsian, normalisasiOutput, nilaiJawaban } from '../lib/quiz/grade';
import { daftarHeading, renderMarkdown, teksPolos } from '../lib/content/render';
import { cariModul } from '../lib/search/query';

let lulus = 0;
const cek = (nama: string, fn: () => void | Promise<void>) => async () => {
  await fn();
  lulus += 1;
  console.log(`  ok  ${nama}`);
};

const uji = [
  cek('isian: trim, kapital, spasi berlebih dianggap sama', () => {
    assert.equal(normalisasiIsian('  SELECT   *  FROM  users '), 'select * from users');
  }),
  cek('isian: titik & titik koma di ujung dibuang', () => {
    assert.equal(normalisasiIsian('select * from users;'), 'select * from users');
    assert.equal(normalisasiIsian('context window.'), 'context window');
  }),
  cek('isian: tidak ada pencocokan fuzzy', () => {
    assert.equal(normalisasiIsian('select'), 'select');
    assert.notEqual(normalisasiIsian('selec'), 'select');
  }),
  cek('pilihan ganda: huruf besar & spasi tetap benar', () => {
    assert.deepEqual(nilaiJawaban({ tipe: 'pilihan_ganda', jawaban: 'b' }, ' B '), {
      benar: true,
      jawaban_benar: 'b',
    });
  }),
  cek('pilihan ganda: huruf di luar pilihan = salah, bukan error', () => {
    assert.equal(nilaiJawaban({ tipe: 'pilihan_ganda', jawaban: 'b' }, 'z').benar, false);
  }),
  cek('output: CRLF & spasi di ujung baris dinormalisasi', () => {
    assert.equal(normalisasiOutput('2  \r\n'), '2');
    assert.equal(normalisasiOutput('a\nb\n\n\n'), 'a\nb');
  }),
  cek('output: spasi di TENGAH baris tidak diubah', () => {
    assert.equal(normalisasiOutput('a  b'), 'a  b');
  }),
  cek('heading: id stabil dari teks', () => {
    const h = daftarHeading('## Parameter `print()`\n\n### Kenapa begini, bukan begitu\n');
    assert.equal(h[0].id, 'parameter-print');
    assert.equal(h[1].id, 'kenapa-begini-bukan-begitu');
  }),
  cek('heading: duplikat diberi akhiran angka', () => {
    const h = daftarHeading('## Error umum\n\nteks\n\n## Error umum\n');
    assert.deepEqual(h.map((x) => x.id), ['error-umum', 'error-umum-1']);
  }),
  cek('heading: heading di dalam blok kode tidak ikut', () => {
    const h = daftarHeading('## Asli\n\n```\n## Bukan heading\n```\n');
    assert.equal(h.length, 1);
  }),
  cek('indeks: nama variabel ber-underscore tetap utuh', () => {
    assert.match(teksPolos('Parameter `top_p` dan `max_tokens`'), /top_p/);
    assert.match(teksPolos('Parameter `top_p` dan `max_tokens`'), /max_tokens/);
  }),
  cek('sanitasi: <script> di konten dibuang', async () => {
    const html = await renderMarkdown('<script>alert(1)</script>\n\nHalo');
    assert.doesNotMatch(html, /<script/i);
    assert.match(html, /Halo/);
  }),
  cek('sanitasi: onclick tidak lolos', async () => {
    const html = await renderMarkdown('<a href="#" onclick="alert(1)">x</a>');
    assert.doesNotMatch(html, /onclick/i);
  }),
  cek('blok kode: dibungkus figure dengan tombol salin', async () => {
    const html = await renderMarkdown('```python\nprint(1)\n```\n');
    assert.match(html, /figure class="blok-kode/);
    assert.match(html, /data-salin/);
    assert.match(html, /Salin kode Python/);
  }),
  cek('blok kode: output tanpa bahasa diberi kelas blok-output', async () => {
    const html = await renderMarkdown('```\n2\n```\n');
    assert.match(html, /blok-output/);
    assert.doesNotMatch(html, /data-salin/);
  }),
  cek('blok kode: tidak dibungkus dua kali', async () => {
    const html = await renderMarkdown('```python\nprint(1)\n```\n');
    assert.equal((html.match(/<figure/g) ?? []).length, 1);
  }),
  cek('pencarian: salah ketik ringan tetap menemukan', () => {
    const indeks = [
      {
        track: 'ai-llm',
        slug: 'x',
        nomor: 1,
        judul: 'Memakai middleware Express',
        heading: [],
        teks: 'middleware adalah fungsi yang berjalan sebelum handler',
        url: '/modul/ai-llm/x',
      },
    ];
    assert.equal(cariModul(indeks, 'midleware').length, 1);
  }),
  cek('pencarian: kata di dalam blok kode ikut ditemukan', () => {
    const indeks = [
      {
        track: 'ai-llm',
        slug: 'y',
        nomor: 2,
        judul: 'Latihan tokenizer',
        heading: [],
        teks: 'jalankan pip install tiktoken lalu hitung',
        url: '/modul/ai-llm/y',
      },
    ];
    assert.equal(cariModul(indeks, 'tiktoken').length, 1);
  }),
  cek('pencarian: satu huruf tidak menghasilkan apa pun', () => {
    assert.deepEqual(cariModul([], 'a'), []);
  }),
];

for (const t of uji) await t();
console.log(`\n${lulus} cek lulus.`);
