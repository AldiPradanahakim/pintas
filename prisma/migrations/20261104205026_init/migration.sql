-- CreateTable
CREATE TABLE "Soal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modulSlug" TEXT NOT NULL,
    "nomor" INTEGER NOT NULL,
    "tipe" TEXT NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "jawaban" TEXT NOT NULL,
    "penjelasan" TEXT NOT NULL,
    "tingkat" TEXT NOT NULL DEFAULT 'dasar'
);

-- CreateTable
CREATE TABLE "Opsi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "soalId" INTEGER NOT NULL,
    "kunci" TEXT NOT NULL,
    "teks" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Opsi_soalId_fkey" FOREIGN KEY ("soalId") REFERENCES "Soal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Solusi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "latihanId" TEXT NOT NULL,
    "bahasa" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "catatan" TEXT
);

-- CreateTable
CREATE TABLE "LogLatihan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "latihanId" TEXT NOT NULL,
    "bahasa" TEXT NOT NULL,
    "ukuranBytes" INTEGER NOT NULL,
    "durasiMs" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "dibuatPada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Soal_modulSlug_idx" ON "Soal"("modulSlug");

-- CreateIndex
CREATE UNIQUE INDEX "Soal_modulSlug_nomor_key" ON "Soal"("modulSlug", "nomor");

-- CreateIndex
CREATE UNIQUE INDEX "Opsi_soalId_kunci_key" ON "Opsi"("soalId", "kunci");

-- CreateIndex
CREATE UNIQUE INDEX "Solusi_latihanId_bahasa_key" ON "Solusi"("latihanId", "bahasa");

-- CreateIndex
CREATE INDEX "LogLatihan_dibuatPada_idx" ON "LogLatihan"("dibuatPada");
