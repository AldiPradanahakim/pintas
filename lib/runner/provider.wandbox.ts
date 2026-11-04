import { BAHASA } from './allowlist';

/**
 * Penyedia eksekusi kode. Satu-satunya berkas yang boleh melakukan panggilan jaringan
 * keluar (lihat lapisan Domain di docs/05-arsitektur.md § 3).
 *
 * Wandbox: gratis, tanpa kunci API. Karena tanpa kunci, tidak ada rahasia yang bisa
 * bocor — tapi juga tidak ada SLA (batasan L1 di arsitektur).
 */
const URL_COMPILE = 'https://wandbox.org/api/compile.json';

export interface HasilEksekusi {
  stdout: string;
  stderr: string;
  exit_code: number;
  durasi_ms: number;
}

export class RunnerError extends Error {
  constructor(
    public jenis: 'timeout' | 'gagal',
    pesan: string,
  ) {
    super(pesan);
  }
}

interface ResponsWandbox {
  status?: string;
  signal?: string;
  compiler_error?: string;
  program_output?: string;
  program_error?: string;
  program_message?: string;
}

export async function jalankanDiPenyedia(
  bahasa: string,
  kode: string,
  { timeoutMs, stdin }: { timeoutMs: number; stdin?: string },
): Promise<HasilEksekusi> {
  const meta = BAHASA[bahasa];
  if (!meta) throw new RunnerError('gagal', `Bahasa "${bahasa}" tidak ada di allowlist`);

  const mulai = Date.now();
  const pembatal = AbortSignal.timeout(timeoutMs);

  let res: Response;
  try {
    res = await fetch(URL_COMPILE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compiler: meta.compiler, code: kode, stdin: stdin ?? '' }),
      signal: pembatal,
    });
  } catch (e) {
    // AbortError = lewat batas waktu. Jaringan putus = gagal.
    if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
      throw new RunnerError('timeout', `Eksekusi melebihi ${Math.round(timeoutMs / 1000)} detik`);
    }
    throw new RunnerError('gagal', `Tidak bisa menghubungi penyedia eksekusi: ${(e as Error).message}`);
  }

  if (!res.ok) {
    throw new RunnerError('gagal', `Penyedia eksekusi menolak permintaan (HTTP ${res.status})`);
  }

  const data = (await res.json()) as ResponsWandbox;

  // Penyedia menaruh error kompilasi di compiler_error; runtime error di program_error.
  const stderr = [data.compiler_error, data.program_error].filter(Boolean).join('\n');
  const stdout = data.program_output ?? '';

  // `status` berupa string angka ("0" = sukses). Kosong + ada stderr juga berarti gagal.
  const exit = data.status === undefined || data.status === '' ? (stderr ? 1 : 0) : Number(data.status);

  return {
    stdout,
    stderr,
    exit_code: Number.isNaN(exit) ? 1 : exit,
    durasi_ms: Date.now() - mulai,
  };
}
