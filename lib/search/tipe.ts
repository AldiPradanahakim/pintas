/**
 * Bentuk satu entri indeks pencarian. Ditulis sebagai tipe sendiri (bukan diimpor dari
 * lib/content) supaya komponen klien tidak ikut menyeret `fs`/`gray-matter` ke bundle
 * hanya demi sebuah tipe.
 */
export interface EntriIndeks {
  track: string;
  slug: string;
  nomor: number;
  judul: string;
  heading: string[];
  teks: string;
  url: string;
}
