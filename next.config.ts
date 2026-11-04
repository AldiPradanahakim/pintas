import type { NextConfig } from 'next';

/**
 * Header keamanan (NFR-09) dipasang di satu tempat supaya tidak bisa terlewat saat
 * menambah halaman. `unsafe-eval` sengaja tidak ada: tidak ada kode yang di-eval di klien.
 */
const CSP = [
  "default-src 'self'",
  // Next.js menyisipkan skrip inline untuk hidrasi.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  // Hanya ke origin sendiri: kode dijalankan lewat proxy server, bukan dari browser.
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;
