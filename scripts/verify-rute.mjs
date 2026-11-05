/**
 * Uji seluruh rute & tautan internal di build produksi.
 *
 * Yang dibuktikan:
 *  1. Setiap rute halaman menjawab 200 (404 hanya untuk URL acak).
 *  2. Setiap tautan internal yang dirender benar-benar bisa dibuka — tidak ada 404
 *     yang tersembunyi di balik tombol (FR-29: tidak ada tautan 404 dari beranda).
 *  3. Halaman project & interview per track berisi isi, bukan halaman kosong.
 *  4. /keystatic 404 di build produksi (FR-34).
 *
 * Jalankan: node scripts/verify-rute.mjs   (server produksi hidup di BASE_URL)
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const KELUARAN = path.resolve('verifikasi');
fs.mkdirSync(KELUARAN, { recursive: true });

const bukti = { rute: [], tautanMati: [], halaman: {}, keystatic: null };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const RUTE = [
  '/',
  '/stack',
  '/panduan',
  '/progres',
  '/cari?q=chunking',
  '/track/ai-llm',
  '/track/fondasi',
  '/track/odoo',
  '/track/dotnet',
  '/track/go',
  '/track/docker',
  '/track/kafka',
  '/track/angular',
  '/project/ai-llm',
  '/interview/ai-llm',
  '/modul/ai-llm/apa-itu-llm',
  '/modul/ai-llm/vector-database',
  '/latihan/ai-llm-01-latihan-1',
];

for (const r of RUTE) {
  const res = await page.goto(BASE + r, { waitUntil: 'domcontentloaded' });
  bukti.rute.push({ rute: r, status: res?.status() ?? 0 });
}

// ---------- Tautan internal dari halaman-halaman kunci ----------
const halamanSumber = ['/', '/track/ai-llm', '/modul/ai-llm/apa-itu-llm', '/panduan', '/progres', '/project/ai-llm', '/interview/ai-llm'];
const sudahDiperiksa = new Set();
const tautan = new Set();

for (const sumber of halamanSumber) {
  await page.goto(BASE + sumber, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const href = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')),
  );
  for (const h of href) if (h && !sudahDiperiksa.has(h)) tautan.add(h);
  sudahDiperiksa.add(sumber);
}

for (const href of tautan) {
  const bersih = href.split('#')[0];
  if (!bersih || bersih === '/') continue;
  const res = await page.goto(BASE + bersih, { waitUntil: 'domcontentloaded' });
  if ((res?.status() ?? 0) >= 400) {
    bukti.tautanMati.push({ href: bersih, status: res?.status() });
  }
}
bukti.jumlahTautanDiperiksa = tautan.size;

// ---------- Isi halaman project & interview ----------
for (const [nama, rute] of [
  ['project', '/project/ai-llm'],
  ['interview', '/interview/ai-llm'],
]) {
  await page.goto(BASE + rute, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  bukti.halaman[nama] = {
    panjangTeks: (await page.locator('main').innerText()).length,
    cuplikan: (await page.locator('main').innerText()).slice(0, 200).replace(/\s+/g, ' '),
  };
}

// ---------- Keystatic harus mati di produksi ----------
const ks = await page.goto(BASE + '/keystatic', { waitUntil: 'domcontentloaded' });
bukti.keystatic = { status: ks?.status() };

// ---------- URL acak harus 404 ----------
const acak = await page.goto(BASE + '/tidak-ada-halaman-ini', { waitUntil: 'domcontentloaded' });
bukti.acak = { status: acak?.status() };

fs.writeFileSync(path.join(KELUARAN, 'bukti-rute.json'), JSON.stringify(bukti, null, 2));
console.log(JSON.stringify(bukti, null, 2));
await browser.close();
