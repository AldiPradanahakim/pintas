import type { Heading } from '@/lib/content';

/**
 * Daftar isi modul (FR-06): heading lapis 1 + pintasan ke lapis 2, latihan, dan kuis.
 * Tautan biasa (bukan onClick) supaya tetap bekerja tanpa JS dan bisa dibuka di tab baru.
 */
export default function DaftarIsi({
  toc,
  tocLapis2,
  adaLatihan,
  adaKuis,
}: {
  toc: Heading[];
  tocLapis2: Heading[];
  adaLatihan: boolean;
  adaKuis: boolean;
}) {
  if (!toc.length) return null;

  return (
    <nav aria-label="Daftar isi" className="text-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Di halaman ini
      </p>
      <ul className="space-y-1 border-l border-slate-200 dark:border-slate-800">
        {toc.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'pl-6' : 'pl-3'}>
            <a
              href={`#${h.id}`}
              className="block border-l-2 border-transparent py-0.5 pl-2 -ml-[1px] text-slate-600 hover:border-teal-500 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"
            >
              {h.teks}
            </a>
          </li>
        ))}
        <li className="pl-3">
          <a href="#lapis-2" className="block py-0.5 pl-2 font-medium text-slate-700 hover:text-teal-700 dark:text-slate-300">
            Lapis 2 — detail penuh
            {tocLapis2.length > 0 && <span className="ml-1 text-xs text-slate-500">({tocLapis2.length} bagian)</span>}
          </a>
        </li>
        {adaLatihan && (
          <li className="pl-3">
            <a href="#latihan" className="block py-0.5 pl-2 text-slate-600 hover:text-teal-700 dark:text-slate-400">
              Latihan
            </a>
          </li>
        )}
        {adaKuis && (
          <li className="pl-3">
            <a href="#kuis" className="block py-0.5 pl-2 text-slate-600 hover:text-teal-700 dark:text-slate-400">
              Kuis
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
}
