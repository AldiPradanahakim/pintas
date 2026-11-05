import { test, expect } from '@playwright/test';

/**
 * E2E alur inti (checklist butir E2E). Yang diuji adalah alur yang kalau rusak
 * membuat platform tidak berguna: membaca modul, menjawab kuis, dan melihat progres.
 *
 * Dijalankan di chromium DAN firefox (NFR-16) — konfigurasi proyek di
 * playwright.config.ts.
 */

test('beranda menampilkan track yang tersedia', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  // Track yang punya modul harus bisa diklik
  const tautan = page.locator('a[href="/track/ai-llm"]');
  await expect(tautan.first()).toBeVisible();
});

test('halaman modul menampilkan materi dua lapis', async ({ page }) => {
  await page.goto('/modul/ai-llm/embedding');
  await expect(page.locator('header h1')).toContainText('Embedding');

  // Lapis 1 dan Lapis 2 harus ada di halaman yang sama (PRD F-04).
  // innerText mengembalikan teks SETELAH text-transform: uppercase, jadi
  // pembandingan dilakukan tanpa peduli huruf besar-kecil.
  const teks = (await page.locator('main').innerText()).toLowerCase();
  expect(teks).toContain('lapis 1');
  expect(teks).toContain('lapis 2');
});

test('halaman modul hanya punya satu h1', async ({ page }) => {
  await page.goto('/modul/ai-llm/embedding');
  // Dua h1 pada satu halaman membingungkan pembaca layar. Judul di badan modul
  // yang ditulis sebagai "# Judul" dibuang saat render.
  await expect(page.locator('h1')).toHaveCount(1);
});

test('daftar isi muncul dan menunjuk ke heading nyata', async ({ page }) => {
  // TOC hanya tampil di layar lebar (lg:block); di ponsel ia sengaja disembunyikan.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/modul/ai-llm/embedding');
  const tautanToc = page.locator('nav[aria-label="Daftar isi"] a[href^="#"]');
  const jumlah = await tautanToc.count();
  expect(jumlah).toBeGreaterThan(0);

  // Setiap tautan harus punya elemen tujuan
  for (let i = 0; i < jumlah; i++) {
    const href = await tautanToc.nth(i).getAttribute('href');
    if (!href || href === '#') continue;
    const ada = await page.locator(href).count();
    expect(ada, `anchor ${href} tidak punya tujuan`).toBeGreaterThan(0);
  }
});

test('kuis: jawaban salah tidak membocorkan kunci di payload', async ({ page }) => {
  await page.goto('/modul/ai-llm/embedding');

  // Kunci jawaban tidak boleh ada di HTML awal (FR-14)
  const html = await page.content();
  expect(html).not.toContain('"jawaban_benar"');

  // Kirim jawaban salah, server harus membalas penilaian
  const balasan = await page.request.post('/api/kuis/embedding/jawab', {
    data: { soal_id: 184, jawaban: 'd' },
  });
  expect(balasan.ok()).toBeTruthy();
  // Amplop respons: { ok: true, data: {...} }
  const { data } = await balasan.json();
  expect(data).toHaveProperty('benar');
  expect(data).toHaveProperty('jawaban_benar');
  expect(data).toHaveProperty('penjelasan');
  expect(data.benar).toBe(false);
});

test('kuis: jawaban benar dinilai benar', async ({ page }) => {
  const balasan = await page.request.post('/api/kuis/embedding/jawab', {
    data: { soal_id: 184, jawaban: 'a' },
  });
  expect(balasan.ok()).toBeTruthy();
  const { data } = await balasan.json();
  expect(data.benar).toBe(true);
});

test('pencarian: Ctrl+K membuka panel dan menampilkan hasil', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Control+k');
  const kotak = page.locator('input[type="search"], input[placeholder*="ari"], input[aria-label*="ari"]').first();
  await expect(kotak).toBeVisible({ timeout: 5000 });

  await kotak.fill('embedding');
  // Hasil dirender sebagai <button> (klik = buka hasil), bukan <a>.
  // Tunggu debounce 200 ms + indeks termuat.
  const hasil = page.locator('button:has-text("embedding")');
  await expect(hasil.first()).toBeVisible({ timeout: 8000 });
});

test('halaman progres bisa dibuka dan menampilkan ringkasan', async ({ page }) => {
  await page.goto('/progres');
  await expect(page.locator('h1')).toBeVisible();
  const teks = await page.locator('main').innerText();
  expect(teks.length).toBeGreaterThan(100);
});

test('halaman yang tidak ada menampilkan 404 dengan jalan keluar', async ({ page }) => {
  const balasan = await page.goto('/halaman-yang-tidak-ada-xyz');
  expect(balasan?.status()).toBe(404);
  // Harus ada tautan kembali, bukan halaman kosong
  const tautan = page.locator('a[href="/"]');
  await expect(tautan.first()).toBeVisible();
});

test('keystatic tidak bisa diakses di produksi (FR-34)', async ({ page }) => {
  const balasan = await page.goto('/keystatic');
  expect(balasan?.status()).toBe(404);
});

test('tidak ada overflow horizontal di lebar 360px (NFR-17)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/modul/ai-llm/embedding');

  const meluber = await page.evaluate(() => {
    const d = document.documentElement;
    return d.scrollWidth > d.clientWidth + 1;
  });
  expect(meluber).toBe(false);
});

test('materi tetap terbaca tanpa JavaScript (NFR-18)', async ({ browser }) => {
  const konteks = await browser.newContext({ javaScriptEnabled: false });
  const halaman = await konteks.newPage();
  await halaman.goto('/modul/ai-llm/embedding');

  const teks = await halaman.locator('body').innerText();
  expect(teks.length).toBeGreaterThan(1000);
  // toLowerCase: label "Lapis 1" dirender dengan text-transform: uppercase,
  // jadi innerText mengembalikan "LAPIS 1".
  expect(teks.toLowerCase()).toContain('lapis 1');

  await konteks.close();
});
