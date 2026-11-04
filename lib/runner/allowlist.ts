/**
 * Allowlist bahasa untuk latihan web (docs/08-api.md § 6.2).
 *
 * Kode API → compiler penyedia. Entri bertanda `catatan` WAJIB dibaca sebelum dipakai:
 * beberapa runtime di penyedia gagal untuk kode yang tampak benar.
 *
 * Menambah bahasa di sini berarti juga menambah dukungan editor (lihat components/kode).
 */
export interface BahasaRunner {
  /** Nama yang dipakai editor & label blok kode. */
  label: string;
  /** Compiler id di penyedia eksekusi. */
  compiler: string;
  /** Nama berkas yang dibuat penyedia, untuk pesan error yang masuk akal. */
  berkas: string;
  catatan?: string;
}

export const BAHASA: Record<string, BahasaRunner> = {
  python: {
    label: 'Python',
    compiler: 'cpython-3.12.7',
    berkas: 'prog.py',
  },
  javascript: {
    label: 'JavaScript',
    compiler: 'nodejs-20.17.0',
    berkas: 'prog.js',
  },
  typescript: {
    label: 'TypeScript',
    compiler: 'typescript-5.6.2',
    berkas: 'prog.ts',
  },
  csharp: {
    label: 'C#',
    compiler: 'dotnetcore-6.0.425',
    berkas: 'Program.cs',
    catatan: 'dotnetcore-8.0.402 gagal di penyedia (File size limit exceeded). Satu berkas, tanpa NuGet.',
  },
  go: {
    label: 'Go',
    compiler: 'go-1.23.2',
    berkas: 'main.go',
    catatan: 'Satu berkas main.go tanpa go.mod; package main + func main wajib.',
  },
  php: {
    label: 'PHP',
    compiler: 'php-8.3.12',
    berkas: 'prog.php',
  },
  java: {
    label: 'Java',
    compiler: 'openjdk-jdk-21+35',
    berkas: 'prog.java',
    catatan: 'Berkas selalu prog.java: kelas public harus bernama prog, atau pakai class Main tanpa public.',
  },
  sql: {
    label: 'SQL',
    compiler: 'sqlite-3.46.1',
    berkas: 'prog.sql',
  },
};

export const kodeBahasa = Object.keys(BAHASA);
export const didukung = (b: string): boolean => Object.hasOwn(BAHASA, b);
