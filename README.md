# HUMIC Potree - Local Point Cloud Viewer

Aplikasi web berbasis Next.js untuk mengunggah, mengonversi, dan memvisualisasikan data *point cloud* secara lokal menggunakan Potree Viewer dan PotreeConverter. Seluruh alur kerja dilakukan di dalam sistem berkas lokal tanpa memerlukan basis data, sistem autentikasi, penyimpanan awan (*cloud storage*), atau sistem antrean (*queue*).

---

## Daftar Isi
- [Struktur Direktori](#struktur-direktori)
- [Prasyarat Sistem](#prasyarat-sistem)
- [Langkah Instalasi](#langkah-instalasi)
  - [1. Clone Repositori](#1-clone-repositori)
  - [2. Instal Dependensi Node.js](#2-instal-dependensi-nodejs)
  - [3. Penyiapan Potree Runtime](#3-penyiapan-potree-runtime)
  - [4. Penyiapan PotreeConverter](#4-penyiapan-potreeconverter)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
- [Pengujian dan Verifikasi](#pengujian-dan-verifikasi)
- [Penjelasan Mengenai Gitignore](#penjelasan-mengenai-gitignore)

---

## Struktur Direktori

Berikut adalah struktur direktori yang dibutuhkan oleh aplikasi:

```text
humic_potree/
├── public/
│   ├── pointclouds/     # Hasil konversi octree (diabaikan oleh Git, kecuali .gitkeep)
│   └── potree/          # Aset runtime Potree library (diabaikan oleh Git)
├── storage/
│   └── uploads/         # Lokasi penyimpanan file upload asli (diabaikan oleh Git, kecuali .gitkeep)
└── tools/
    ├── PotreeConverter  # Binary executable PotreeConverter (diabaikan oleh Git)
    └── liblaszip.dylib  # Library dependency untuk macOS (diabaikan oleh Git)
```

---

## Prasyarat Sistem

Sebelum memulai instalasi, pastikan sistem Anda telah memiliki:
1. **Node.js** (versi 18.x atau yang lebih baru).
2. **npm** (paket bawaan Node.js).
3. **PDAL** (Point Data Abstraction Library) - *Opsional*. Hanya dibutuhkan jika Anda ingin mendukung konversi dari format non-native (seperti `.e57`, `.ply`, `.pts`, `.xyz`). Diperlukan agar perintah CLI `pdal` dapat diakses dari terminal.

---

## Langkah Instalasi

### 1. Clone Repositori
Clone proyek ini ke direktori lokal Anda:
```bash
git clone https://github.com/hauzanrafiattallah/humic_potree.git
cd humic_potree
```

### 2. Instal Dependensi Node.js
Jalankan perintah berikut untuk menginstal seluruh pustaka yang diperlukan:
```bash
npm install
```

### 3. Penyiapan Potree Runtime
Aset pustaka visualisasi Potree (`public/potree`) tidak di-push ke GitHub untuk menjaga ukuran repositori tetap ringan. Lakukan langkah berikut untuk menyiapkannya:
1. Unduh rilis resmi Potree (disarankan versi 1.8 atau 1.8.2) dari repositori resmi Potree di GitHub.
2. Ekstrak file arsip tersebut.
3. Salin direktori `build`, `libs`, dan `resources` dari hasil ekstrak ke dalam folder `/public/potree/` proyek ini.
4. Struktur akhir direktori harus terlihat seperti berikut:
   - `public/potree/build/`
   - `public/potree/libs/`
   - `public/potree/resources/`

### 4. Penyiapan PotreeConverter
Aplikasi memerlukan binary `PotreeConverter` untuk memproses file `.las`/`.laz` menjadi struktur data octree. Karena binary ini bersifat *platform-dependent* (berbeda untuk Windows, Linux, dan macOS), Anda harus menyediakannya sendiri:
1. Unduh rilis binary `PotreeConverter` (versi 2.1 atau 2.1.1) yang sesuai dengan sistem operasi Anda dari repositori resmi PotreeConverter di GitHub.
2. Tempatkan file executable `PotreeConverter` ke dalam direktori `/tools/` proyek ini.
3. **Catatan khusus pengguna macOS:**
   - Unduh juga file `liblaszip.dylib` dan letakkan di dalam folder `/tools/`.
   - Instal dependensi Threading Building Blocks (TBB) menggunakan Homebrew dengan menjalankan perintah:
     ```bash
     brew install tbb
     ```

---

## Konfigurasi Environment

Aplikasi ini menggunakan nilai *default* yang sudah disesuaikan untuk dijalankan langsung. Jika Anda ingin melakukan kustomisasi path atau kapasitas upload, buat file `.env` di direktori utama proyek:

```env
POTREE_CONVERTER_PATH=./tools/PotreeConverter
UPLOAD_DIR=./storage/uploads
POINTCLOUD_OUTPUT_DIR=./public/pointclouds
NEXT_PUBLIC_POINTCLOUD_BASE_URL=/pointclouds
MAX_UPLOAD_MB=1024
PDAL_PATH=pdal
```

Penjelasan variabel:
- `POTREE_CONVERTER_PATH`: Path menuju binary executable converter.
- `UPLOAD_DIR`: Direktori sementara penyimpanan file mentah hasil unggahan.
- `POINTCLOUD_OUTPUT_DIR`: Direktori keluaran hasil konversi yang akan dibaca oleh viewer web.
- `MAX_UPLOAD_MB`: Batas maksimum ukuran file yang diperbolehkan dalam satuan Megabyte.

---

## Cara Menjalankan Aplikasi

Jalankan server pengembangan lokal dengan perintah berikut:
```bash
npm run dev
```

Buka peramban (*browser*) Anda dan akses alamat:
`http://localhost:3000`

Anda dapat mulai mengunggah file point cloud pada halaman `/upload` dan melihat hasilnya di halaman `/datasets` atau `/viewer/[dataset]`.

---

## Pengujian dan Verifikasi

Untuk memastikan semua modul berjalan dengan baik, Anda dapat menjalankan perintah verifikasi berikut:

```bash
# Menjalankan unit test lokal
npm test

# Menjalankan linter kode
npm run lint

# Melakukan pengujian build produksi
npm run build
```

---

## Penjelasan Mengenai Gitignore

Folder rujukan aset visualisasi (`public/potree/`) dan binary executables (`tools/PotreeConverter`) sengaja dimasukkan ke dalam `.gitignore` dengan alasan:
1. **Ukuran File**: Berkas-berkas pustaka eksternal dan binary memiliki ukuran yang sangat besar, sehingga tidak efisien jika dimasukkan ke dalam Git.
2. **Ketergantungan Platform**: Binary untuk macOS tidak akan bisa dijalankan di komputer berbasis Windows atau Linux, begitu pula sebaliknya. 

Pengguna lain yang melakukan `clone` repositori ini **tetap dapat menggunakan aplikasi dengan normal** setelah mengikuti instruksi penyiapan manual pada bagian [Langkah Instalasi](#langkah-instalasi) di atas.
