import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/ui/Header';

export const metadata: Metadata = {
  title: {
    default: 'Pintas — belajar stack sampai ke detail terkecil',
    template: '%s · Pintas',
  },
  description:
    'Modul pendek berbahasa Indonesia: lapis 1 untuk langsung praktik, lapis 2 untuk semua parameter dan error.',
};

/**
 * Skrip tema dijalankan SEBELUM body dirender (bukan di useEffect): tanpa ini, pengguna
 * mode gelap melihat kilatan putih di setiap muat halaman (FR-35).
 */
const SKRIP_TEMA = `
(function(){
  try {
    var p = localStorage.getItem('pintas:v1:tema');
    var gelap = p ? p === 'gelap' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (gelap) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SKRIP_TEMA }} />
      </head>
      <body className="min-h-screen">
        <Header />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</main>
        <footer className="mx-auto w-full max-w-6xl px-4 pb-10 pt-4 text-sm text-slate-500 sm:px-6 dark:text-slate-400">
          <p>
            Pintas · materi berbahasa Indonesia ·{' '}
            <a className="underline" href="/panduan">
              panduan
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
