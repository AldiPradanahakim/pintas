/**
 * Uji alur progres di browser sungguhan — bukan sekadar "halaman terbuka".
 *
 * Yang dibuktikan:
 *  1. Kuis dijawab semua → skor tersimpan di `pintas:v1:progres` (bukan kunci lain).
 *  2. Latihan web lulus → status `lulus` masuk ke progres yang sama.
 *  3. Modul otomatis berstatus "Modul selesai" setelah kuis tuntas + satu latihan lulus.
 *  4. /progres menampilkan 1 modul selesai, dan ekspor menghasilkan berkas JSON valid.
 *  5. Impor berkas yang dirusak DITOLAK dan progres lama tidak hilang.
 *  6. Reset tidak jalan tanpa mengetik HAPUS.
 *
 * Jalankan: node scripts/verify-progres.mjs   (server hidup di BASE_URL)
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const KELUARAN = path.resolve('verifikasi');
fs.mkdirSync(KELUARAN, { recursive: true });

const bukti = { catatan: [] };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on('pageerror', (e) => bukti.catatan.push(`pageerror: ${e.message}`));

const bacaProgres = () =>
  page.evaluate(() => {
    const mentah = localStorage.getItem('pintas:v1:progres');
    return mentah ? JSON.parse(mentah) : null;
  });

// ---------- 1. Jawab kuis sampai tuntas ----------
const SLUG = 'apa-itu-llm';
await page.goto(`${BASE}/modul/ai-llm/${SLUG}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Kunci jawaban tidak ada di HTML; skrip ini menjawab lewat UI seperti pengguna.
// Cakupan `#kuis ol > li` penting: halaman punya beberapa daftar lain (daftar isi,
// riwayat), dan `ol > li` tanpa cakupan mengambil yang salah.
const jawaban = { 1: 'b', 2: 'b', 3: 'context window', 4: 'temperature' };
bukti.kuis = { dijawab: 0 };

for (const [nomorStr, nilai] of Object.entries(jawaban)) {
  const nomor = Number(nomorStr);
  const kartu = page.locator('#kuis ol > li').nth(nomor - 1);
  const radio = kartu.locator('input[type="radio"]');
  if (await radio.count()) {
    const opsiKe = { a: 0, b: 1, c: 2, d: 3 }[nilai] ?? 0;
    await radio.nth(opsiKe).check();
  } else {
    await kartu.locator('input[type="text"]').fill(nilai);
  }
  await kartu.getByRole('button', { name: /Periksa jawaban/ }).click();
  await page.waitForTimeout(700);
  bukti.kuis.dijawab += 1;
}

await page.waitForTimeout(1000);
bukti.setelahKuis = {
  progres: await bacaProgres(),
  adaSkor: await page.locator('text=/Skor \\d+\\/\\d+/').count(),
};

// ---------- 2. Jalankan latihan web sampai lulus ----------
const kodeBenar = `token = 8192
kata_per_token = 0.75
print(int(token * kata_per_token))
`;
const editor = page.locator('.cm-content').first();
if (await editor.count()) {
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(kodeBenar);
  await page.getByRole('button', { name: 'Jalankan' }).first().click();
  // Wandbox bisa lambat (2–7 detik); panel hasil diberi data-status-latihan supaya
  // selector tidak salah menangkap heading "Error umum" di lapis 2.
  await page.waitForSelector('[data-status-latihan]', { timeout: 90000 });
}
bukti.latihan = {
  status: await page.locator('[data-label-status]').first().textContent().catch(() => null),
  progres: await bacaProgres(),
};

// ---------- 3. Status modul di halaman ----------
bukti.badge = await page.locator('text=/Modul selesai|Belum selesai/').first().textContent().catch(() => null);

// ---------- 4. /progres ----------
await page.goto(`${BASE}/progres`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
bukti.halamanProgres = {
  teks: (await page.locator('main').innerText()).slice(0, 400),
  adaModulSelesai: await page.locator('text=/1 dari \\d+ modul selesai/').count(),
};

// ---------- 5. Ekspor ----------
const unduhan = page.waitForEvent('download', { timeout: 20000 });
await page.getByRole('button', { name: 'Ekspor progres' }).click();
const berkas = await unduhan;
const isiEkspor = JSON.parse(fs.readFileSync(await berkas.path(), 'utf8'));
bukti.ekspor = {
  nama: berkas.suggestedFilename(),
  aplikasi: isiEkspor.aplikasi,
  versi: isiEkspor.versi,
  jumlahKuis: Object.keys(isiEkspor.kuis ?? {}).length,
  jumlahLatihan: Object.keys(isiEkspor.latihan ?? {}).length,
};

// ---------- 6. Impor berkas rusak ditolak, progres lama utuh ----------
const sebelum = await bacaProgres();
const berkasRusak = path.join(KELUARAN, 'progres-rusak.json');
fs.writeFileSync(berkasRusak, JSON.stringify({ aplikasi: 'pintas', versi: 99, kuis: 'bukan objek' }));
await page.locator('input[type="file"]').setInputFiles(berkasRusak);
await page.waitForTimeout(1200);
const sesudah = await bacaProgres();
bukti.imporRusak = {
  pesan: await page.locator('[role="status"]').textContent().catch(() => null),
  progresUtuh: JSON.stringify(sebelum) === JSON.stringify(sesudah),
};

// ---------- 7. Reset tanpa HAPUS tidak berpengaruh ----------
const tombolHapus = page.getByRole('button', { name: 'Hapus semua progres' });
bukti.reset = { nonaktifSebelumKetik: await tombolHapus.isDisabled() };
await page.getByLabel('Ketik HAPUS untuk konfirmasi').fill('hapus');
bukti.reset.masihNonaktifHurufKecil = await tombolHapus.isDisabled();
await page.getByLabel('Ketik HAPUS untuk konfirmasi').fill('HAPUS');
bukti.reset.aktifSetelahHAPUS = await tombolHapus.isEnabled();
await tombolHapus.click();
await page.waitForTimeout(800);
bukti.reset.progresSetelahReset = await bacaProgres();

await page.screenshot({ path: path.join(KELUARAN, 'progres-1280.png') });
fs.writeFileSync(path.join(KELUARAN, 'bukti-progres.json'), JSON.stringify(bukti, null, 2));
console.log(JSON.stringify(bukti, null, 2));
await browser.close();
