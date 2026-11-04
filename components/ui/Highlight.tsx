/** Sorot semua kemunculan kata kunci (tanpa regex dari input pengguna: aman dari ReDoS). */
export default function Highlight({ teks, kata }: { teks: string; kata: string }) {
  const q = kata.trim();
  if (!q) return <>{teks}</>;

  const bawah = teks.toLowerCase();
  const cari = q.toLowerCase();
  const potong: React.ReactNode[] = [];
  let posisi = 0;

  for (;;) {
    const i = bawah.indexOf(cari, posisi);
    if (i < 0) {
      potong.push(teks.slice(posisi));
      break;
    }
    if (i > posisi) potong.push(teks.slice(posisi, i));
    potong.push(
      <mark key={i} className="rounded bg-amber-200 px-0.5 text-slate-900 dark:bg-amber-300">
        {teks.slice(i, i + q.length)}
      </mark>,
    );
    posisi = i + q.length;
  }

  return <>{potong}</>;
}
