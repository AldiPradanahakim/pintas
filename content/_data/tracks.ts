/**
 * Daftar track + tier (PRD F-01). Ditulis tangan, bukan dibaca dari folder: tier dan
 * satu baris "kegunaan" adalah keputusan editorial yang tidak bisa ditebak dari nama
 * direktori. Jumlah modul & estimasi jam TIDAK ditulis di sini — dihitung dari konten
 * supaya tidak pernah basi saat modul ditambah.
 */
export interface Track {
  slug: string;
  nama: string;
  tier: 0 | 1 | 2 | 3;
  /** Satu baris untuk kartu beranda. */
  kegunaan: string;
  /** Satu paragraf "track ini untuk siapa" di halaman track. */
  untukSiapa: string;
  /** false = belum ada konten: kartu tampil "Segera" tanpa href. */
  tersedia: boolean;
}

export const NAMA_TIER: Record<Track['tier'], string> = {
  0: 'Tier 0 — Fondasi',
  1: 'Tier 1 — MVP',
  2: 'Tier 2 — Lanjutan',
  3: 'Tier 3 — Spesialis',
};

export const TRACKS: Track[] = [
  {
    slug: 'ai-llm',
    nama: 'AI & LLM Engineer',
    tier: 1,
    kegunaan: 'Membangun aplikasi di atas model bahasa: RAG, agent, evaluasi.',
    untukSiapa:
      'Untuk pengembang web yang sudah bisa membuat aplikasi CRUD dan ingin memakai model bahasa di produk nyata — bukan sekadar memanggil API, tapi tahu kapan hasilnya bisa dipercaya dan kapan tidak.',
    tersedia: true,
  },
  {
    slug: 'fondasi',
    nama: 'Fondasi',
    tier: 0,
    kegunaan: 'Git, HTTP, SQL, CLI, Docker, testing — dipakai semua track.',
    untukSiapa: 'Untuk siapa pun yang ingin dasar-dasarnya tidak lagi jadi penghalang saat membaca dokumentasi.',
    tersedia: true,
  },
  {
    slug: 'odoo',
    nama: 'Odoo Developer',
    tier: 2,
    kegunaan: 'ERP Python: model, view XML/QWeb, OWL, manifest & inheritance.',
    untukSiapa: 'Untuk pengembang yang akan menyesuaikan ERP untuk perusahaan, bukan membangun ERP dari nol.',
    tersedia: true,
  },
  {
    slug: 'dotnet',
    nama: '.NET & C#',
    tier: 2,
    kegunaan: 'ASP.NET Core, EF Core, Blazor, Minimal API.',
    untukSiapa: 'Untuk pengembang yang masuk ke lingkungan enterprise berbasis Microsoft.',
    tersedia: true,
  },
  {
    slug: 'docker',
    nama: 'Docker',
    tier: 3,
    kegunaan: 'Mengemas aplikasi agar jalan sama di laptop, CI, dan server.',
    untukSiapa: 'Untuk pengembang yang aplikasinya harus berjalan identik di banyak mesin.',
    tersedia: true,
  },
  {
    slug: 'go',
    nama: 'Go',
    tier: 3,
    kegunaan: 'Gin/Fiber, goroutine, binary tunggal.',
    untukSiapa: 'Untuk pengembang yang butuh layanan kecil dengan konsumsi memori rendah.',
    tersedia: true,
  },
  {
    slug: 'kafka',
    nama: 'Kafka',
    tier: 3,
    kegunaan: 'Topik, partisi, offset, consumer group, jaminan pengiriman.',
    untukSiapa:
      'Untuk pengembang yang harus menyambungkan beberapa layanan lewat aliran kejadian, bukan panggilan langsung — dan perlu tahu apa yang terjadi saat salah satu layanan mati.',
    tersedia: true,
  },
  {
    slug: 'angular',
    nama: 'Angular',
    tier: 3,
    kegunaan: 'Komponen, signals, service, routing, form, HTTP.',
    untukSiapa:
      'Untuk pengembang yang masuk ke aplikasi frontend berskala besar dengan struktur baku dan tipe yang ketat.',
    tersedia: true,
  },
];

export const trackDari = (slug: string): Track | null => TRACKS.find((t) => t.slug === slug) ?? null;
