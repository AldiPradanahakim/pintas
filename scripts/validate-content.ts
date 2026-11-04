/**
 * Validasi konten: dipakai `npm run validate:content` dan oleh `npm run build`.
 *
 * Yang diperiksa di sini hanya hal yang TIDAK bisa diperiksa Zod: keunikan slug lintas
 * track, prasyarat yang menunjuk modul yang tidak ada, tautan internal yang mati, dan
 * latihan web yang bahasanya tidak didukung runner.
 */
import { loadSemuaModul } from '../lib/content/load';
import { didukung } from '../lib/runner/allowlist';

async function main() {
  const modul = await loadSemuaModul();
  const galat: string[] = [];
  const peringatan: string[] = [];

  const slugTerpakai = new Map<string, string>();
  const urlAda = new Set(modul.map((m) => `/modul/${m.frontmatter.track}/${m.frontmatter.slug}`));

  for (const m of modul) {
    const { track, slug, prasyarat, latihan, kuis } = m.frontmatter;

    const slugLama = slugTerpakai.get(slug);
    if (slugLama) galat.push(`${m.berkas}: slug "${slug}" sudah dipakai ${slugLama}`);
    else slugTerpakai.set(slug, m.berkas);

    for (const p of prasyarat) {
      // Prasyarat ditulis `track/slug` supaya tidak ambigu antar-track.
      if (!urlAda.has(`/modul/${p}`)) {
        galat.push(`${m.berkas}: prasyarat "${p}" tidak menunjuk modul yang ada`);
      }
    }

    for (const l of latihan) {
      if (l.jenis === 'web' && !didukung(l.bahasa)) {
        galat.push(`${m.berkas}: latihan "${l.id}" memakai bahasa "${l.bahasa}" yang tidak ada di allowlist runner`);
      }
    }

    const idLatihan = new Set<string>();
    for (const l of latihan) {
      if (idLatihan.has(l.id)) galat.push(`${m.berkas}: id latihan "${l.id}" dobel di satu modul`);
      idLatihan.add(l.id);
    }

    if (kuis.length < 3 || kuis.length > 5) {
      galat.push(`${m.berkas}: ${kuis.length} soal (wajib 3–5)`);
    }

    // Tautan internal di badan markdown: /modul/... atau /track/... yang menunjuk 404.
    for (const cocok of m.isi.matchAll(/\]\((\/[^)\s]+)\)/g)) {
      const tujuan = cocok[1].split('#')[0].replace(/\/$/, '');
      if (!tujuan) continue;
      const dikenal =
        urlAda.has(tujuan) ||
        /^\/(stack|panduan|progres|cari|modul|track|latihan|project|interview)(\/|$)/.test(tujuan);
      if (!dikenal) peringatan.push(`${m.berkas}: tautan "${cocok[1]}" bukan rute yang dikenal`);
    }
  }

  for (const p of peringatan) console.warn('peringatan:', p);

  if (galat.length) {
    console.error(`Validasi konten GAGAL (${galat.length}):`);
    for (const g of galat) console.error('  -', g);
    process.exit(1);
  }

  console.log(`Validasi konten lulus: ${modul.length} modul, ${peringatan.length} peringatan.`);
}

main().catch((e) => {
  console.error('Validasi gagal:', e instanceof Error ? e.message : e);
  process.exit(1);
});
