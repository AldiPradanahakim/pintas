@echo off
cd /d "%~dp0"
title Pintas
chcp 65001 >nul

echo ============================================
echo   Pintas - situs belajar pemrograman
echo ============================================
echo.

echo [1/5] Memeriksa Node.js...
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

echo [2/5] Memeriksa dependensi...
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

echo [3/5] Memeriksa database...
if not exist "prisma\data.db" (
    echo       Belum ada. Membuat dan mengisi dari konten...
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

echo [4/5] Memeriksa hasil build...
if not exist ".next\" (
    echo       Belum ada. Build pertama bisa 1-2 menit...
    call npm run build
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Build gagal. Lihat pesan di atas.
        pause
        exit /b 1
    )
) else (
    echo       Sudah ada, dilewati.
)

echo [5/5] Menjalankan situs...
echo.
echo ============================================
echo   Buka di browser: http://localhost:3000
echo   Tutup jendela ini untuk mematikan situs.
echo ============================================
echo.

start "" http://localhost:3000
call npm start
pause
