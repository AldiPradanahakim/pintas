'use client';

/**
 * Penangkap error tingkat akar (NFR-15) — dipakai kalau error terjadi di luar
 * subtree `app/error.tsx` (misalnya di layout). Harus mendefinisikan <html> sendiri
 * karena layout tidak ikut dirender saat error di level ini.
 */
export default function GalatGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '40rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Situs gagal dimuat</h1>
        <p style={{ color: '#555', marginBottom: '1rem' }}>
          Terjadi kesalahan di tingkat halaman. Progres belajar Anda tersimpan di browser
          ini dan tidak terpengaruh.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '0.4rem 0.8rem',
            background: '#0f766e',
            color: '#fff',
            border: 0,
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Muat ulang
        </button>
        <p style={{ marginTop: '1rem' }}>
          <a href="/" style={{ color: '#0f766e' }}>
            Ke beranda
          </a>
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre style={{ marginTop: '1rem', fontSize: '0.75rem', overflowX: 'auto' }}>
            {error.message}
          </pre>
        )}
      </body>
    </html>
  );
}
