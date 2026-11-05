import { defineConfig, devices } from '@playwright/test';

/**
 * Konfigurasi E2E (checklist butir E2E, NFR-16 lintas peramban).
 *
 * Dua proyek: chromium (Chrome/Edge) dan firefox. Keduanya menjalankan tes yang
 * sama — itu inti dari uji lintas peramban: perilaku harus sama, bukan hanya
 * "tampil di satu peramban".
 *
 * Server dijalankan otomatis dari build produksi (`next start`), bukan `next dev`,
 * supaya yang diuji adalah artefak yang benar-benar akan dipakai.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:3210',
    trace: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run start -- -p 3210',
    url: 'http://127.0.0.1:3210',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
