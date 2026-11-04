import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { java } from '@codemirror/lang-java';
import { php } from '@codemirror/lang-php';
import { go } from '@codemirror/lang-go';
import type { Extension } from '@codemirror/state';

/**
 * Ekstensi bahasa editor. Kode bahasa mengikuti allowlist runner (lib/runner/allowlist.ts);
 * C# sengaja tanpa ekstensi khusus — `clike` bawaan sudah cukup untuk pewarnaan dasar,
 * dan menambah paket C# (~200 KB) tidak sepadan untuk satu bahasa.
 */
export function ekstensiBahasa(bahasa: string): Extension {
  switch (bahasa) {
    case 'python':
      return python();
    case 'javascript':
      return javascript();
    case 'typescript':
      return javascript({ typescript: true });
    case 'sql':
      return sql();
    case 'java':
      return java();
    case 'php':
      return php();
    case 'go':
      return go();
    default:
      return [];
  }
}
