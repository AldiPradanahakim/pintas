import { normalisasiOutput } from '../quiz/grade';
import { jalankanDiPenyedia, RunnerError } from './provider.wandbox';

export interface HasilLatihan {
  status: 'lulus' | 'gagal' | 'error';
  stdout: string;
  stderr: string;
  exit_code: number;
  durasi_ms: number;
  output_harapan: string;
  pesan: string | null;
}

/**
 * Jalankan kode lalu bandingkan stdout dengan output harapan.
 *
 * `output_harapan` datang dari server (dibaca dari frontmatter modul), bukan dari klien:
 * kalau klien yang mengirim harapannya, "lulus" bisa dipalsukan hanya dengan mengirim
 * output apa pun sebagai harapan.
 */
export async function jalankanLatihan({
  bahasa,
  kode,
  outputHarapan,
  timeoutMs,
}: {
  bahasa: string;
  kode: string;
  outputHarapan: string;
  timeoutMs: number;
}): Promise<HasilLatihan> {
  let hasil;
  try {
    hasil = await jalankanDiPenyedia(bahasa, kode, { timeoutMs });
  } catch (e) {
    if (e instanceof RunnerError) {
      // Timeout & kegagalan penyedia bukan "kode salah" — pengguna tidak boleh disalahkan.
      return {
        status: 'error',
        stdout: '',
        stderr: e.message,
        exit_code: -1,
        durasi_ms: 0,
        output_harapan: outputHarapan,
        pesan: e.message,
      };
    }
    throw e;
  }

  const harapan = normalisasiOutput(outputHarapan);
  const dapat = normalisasiOutput(hasil.stdout);
  const lulus = hasil.exit_code === 0 && dapat === harapan;

  return {
    status: lulus ? 'lulus' : hasil.exit_code !== 0 ? 'error' : 'gagal',
    stdout: hasil.stdout,
    stderr: hasil.stderr,
    exit_code: hasil.exit_code,
    durasi_ms: hasil.durasi_ms,
    output_harapan: harapan,
    pesan:
      lulus || hasil.exit_code !== 0
        ? null
        : 'Output tidak sesuai. Bandingkan dengan output yang diharapkan di bawah.',
  };
}
