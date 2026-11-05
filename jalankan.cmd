@echo off
cd /d "%~dp0"
title Pintas
chcp 65001 >nul

echo ============================================
echo   Pintas - situs belajar pemrograman
echo ============================================
echo.

echo [1/4] Memeriksa Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js tidak ditemukan.
    echo Install dulu dari https://nodejs.org ^(pilih versi 20 atau lebih baru^),
    echo lalu tutup jendela ini dan dobel-klik lagi.
    echo.
    pause
    exit /b 1
)
for /f "delims=" %%v in ('node -v') do echo       Node.js %%v terdeteksi

echo [2/4] Memeriksa dependensi...
if not exist "node_modules\" (
    echo       Belum ada. Menjalankan npm install ^(sekali saja, butuh beberapa menit^)...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] npm install gagal. Periksa koneksi internet.
        pause
        exit /b 1
    )
) else (
    echo       Sudah ada, dilewati.
)

echo [3/4] Memeriksa database...
if not exist "prisma\data.db" (
    echo       Belum ada. Membuat dan mengisi soal kuis dari konten...
    call npx prisma migrate deploy
    call npx prisma generate
    call npx tsx prisma/seed.ts
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Gagal menyiapkan database.
        pause
        exit /b 1
    )
) else (
    echo       Sudah ada, dilewati.
)

rem Isi soal kuis disegarkan setiap kali dijalankan: murah (kurang dari 2 detik) dan
rem menghapus satu kelas bug - menambah soal di content\.md tapi kuis di situs tetap
rem yang lama karena database tidak pernah diperbarui.
echo [4/4] Menyegarkan soal kuis dari konten...
call npx tsx prisma/seed.ts >nul 2>&1
if %errorlevel% neq 0 (
    echo       PERINGATAN: gagal menyegarkan soal. Situs tetap jalan dengan soal lama.
)

echo.
echo ============================================
echo   Buka di browser: http://localhost:3000
echo.
echo   Mode dev: perubahan di content\*.md langsung
echo   terlihat setelah halaman dimuat ulang, tanpa
echo   perlu build. Tutup jendela ini untuk mematikan.
echo ============================================
echo.

rem npm run dev, bukan npm start: konten dibaca ulang tiap permintaan, jadi mengubah
rem modul tidak butuh build ulang. Lebih lambat sedikit per halaman, tapi tidak ada
rem langkah yang bisa basi.
start "" http://localhost:3000
call npm run dev
pause
