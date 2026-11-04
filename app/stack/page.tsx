import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar stack',
  description: 'Semua bahasa dan framework yang dibahas Pintas, dengan kegunaan satu baris.',
};

/**
 * Halaman daftar stack (F-12). Entri yang datanya belum diputuskan ditandai
 * `TODO: konfirmasi` alih-alih dikosongkan — supaya kelihatan apa yang masih kurang.
 */
const STACK = [
  {
    nama: 'Python',
    jenis: 'Bahasa',
    kegunaan: 'Skrip, data, backend, dan hampir semua ekosistem AI.',
    track: 'ai-llm',
    db: 'psycopg / SQLAlchemy · DATABASE_URL postgresql://… · alembic',
    api: 'FastAPI · @app.get("/items")',
    sambung: 'Bisa dipanggil dari bahasa lain lewat HTTP; klien `requests`/`httpx`',
  },
  {
    nama: 'JavaScript / TypeScript',
    jenis: 'Bahasa',
    kegunaan: 'Satu bahasa untuk browser dan server.',
    track: 'ai-llm',
    db: 'pg / Prisma · DATABASE_URL postgres://… · prisma migrate',
    api: 'Express / Next Route Handler · app.get("/items")',
    sambung: 'fetch bawaan; dari Python pakai httpx',
  },
  {
    nama: 'Next.js',
    jenis: 'Framework',
    kegunaan: 'React dengan routing, render server, dan route handler dalam satu proses.',
    track: 'ai-llm',
    db: 'Prisma lewat lib/db.ts · SQLite/PostgreSQL',
    api: 'Route Handler · export async function GET()',
    sambung: 'API-nya HTTP biasa; framework lain tinggal memanggil URL-nya',
  },
  {
    nama: 'SQL',
    jenis: 'Bahasa kueri',
    kegunaan: 'Mengambil dan mengubah data relasional.',
    track: 'fondasi',
    db: 'SQLite/PostgreSQL CLI · psql "postgresql://…"',
    api: 'Tidak berlaku — SQL dipakai di dalam bahasa lain',
    sambung: 'Driver per bahasa: psycopg (Python), pg (Node), Npgsql (.NET)',
  },
  {
    nama: 'Odoo',
    jenis: 'Framework',
    kegunaan: 'ERP: modul Python dengan view XML dan ORM sendiri.',
    track: 'odoo',
    db: 'ORM Odoo · PostgreSQL · odoo-bin -d nama_db',
    api: 'Controller · @http.route("/items", type="json")',
    sambung: 'JSON-RPC / XML-RPC; bahasa lain tinggal memanggil endpoint',
  },
  {
    nama: 'C# / .NET',
    jenis: 'Bahasa + framework',
    kegunaan: 'Backend enterprise dan aplikasi desktop Windows.',
    track: 'dotnet',
    db: 'EF Core / Npgsql · ConnectionStrings:Default',
    api: 'Minimal API · app.MapGet("/items", …)',
    sambung: 'HttpClient; dari Node tinggal fetch',
  },
  {
    nama: 'Go',
    jenis: 'Bahasa',
    kegunaan: 'Layanan kecil, cepat, satu binary tanpa runtime.',
    track: 'go',
    db: 'database/sql + pgx · DSN postgres://…',
    api: 'Gin · r.GET("/items", …)',
    sambung: 'net/http standar; tidak ada ketergantungan runtime',
  },
  {
    nama: 'Docker',
    jenis: 'Tool',
    kegunaan: 'Mengemas aplikasi agar jalan sama di mana pun.',
    track: 'docker',
    db: 'Container database terpisah + network internal',
    api: 'Tidak berlaku — Docker menjalankan, bukan menyajikan API',
    sambung: 'Port mapping / network compose',
  },
];

export default function HalamanStack() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Daftar stack</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Semua bahasa dan framework yang dibahas, satu baris kegunaan, plus cara konek DB dan membuat REST API.
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-3">Nama</th>
              <th className="py-2 pr-3">Jenis</th>
              <th className="py-2 pr-3">Kegunaan</th>
              <th className="py-2 pr-3">Track</th>
              <th className="py-2 pr-3">Konek DB</th>
              <th className="py-2 pr-3">REST API</th>
              <th className="py-2">Dari bahasa lain</th>
            </tr>
          </thead>
          <tbody>
            {STACK.map((s) => (
              <tr key={s.nama} className="border-b border-slate-100 align-top dark:border-slate-800">
                <td className="py-2 pr-3 font-medium">{s.nama}</td>
                <td className="py-2 pr-3 text-slate-600 dark:text-slate-400">{s.jenis}</td>
                <td className="py-2 pr-3">{s.kegunaan}</td>
                <td className="py-2 pr-3 font-mono text-xs text-slate-500">{s.track}</td>
                <td className="py-2 pr-3 text-slate-600 dark:text-slate-400">{s.db}</td>
                <td className="py-2 pr-3 text-slate-600 dark:text-slate-400">{s.api}</td>
                <td className="py-2 text-slate-600 dark:text-slate-400">{s.sambung}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
