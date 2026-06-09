# Product Requirements Document

## Local Point Cloud Viewer MVP with Next.js, Potree Viewer, and PotreeConverter

## 1. Ringkasan Produk

Produk ini adalah aplikasi web lokal untuk mengunggah, mengonversi, dan menampilkan data 3D point cloud menggunakan Potree. Aplikasi dibuat sebagai MVP lokal dengan Next.js sebagai frontend dan backend, Potree Viewer sebagai komponen visualisasi 3D, serta PotreeConverter sebagai alat konversi file point cloud ke format yang dapat dibaca oleh Potree Viewer.

Pada tahap MVP, aplikasi tidak menggunakan database, autentikasi, cloud storage, atau deployment production. Seluruh file upload, hasil konversi, dan data viewer disimpan di filesystem lokal.

## 2. Tujuan Produk

Tujuan utama produk adalah membuktikan alur teknis berikut:

```text
Upload file .las/.laz
        ↓
Simpan file ke folder lokal
        ↓
Jalankan PotreeConverter
        ↓
Simpan hasil konversi ke folder public
        ↓
Tampilkan point cloud di browser menggunakan Potree Viewer
```

MVP ini menjadi dasar sebelum dikembangkan menjadi platform full stack yang lebih lengkap dengan database, user management, cloud storage, background worker, dan deployment.

## 3. Latar Belakang

Data point cloud sering digunakan dalam pemetaan, arsitektur, konstruksi, interior, pemindaian ruangan, dan LiDAR. Namun, file point cloud umumnya berukuran besar dan tidak dapat langsung ditampilkan secara efisien di browser.

Potree digunakan karena mendukung visualisasi point cloud di browser berbasis WebGL. PotreeConverter digunakan untuk mengubah file point cloud menjadi struktur data yang lebih sesuai untuk streaming dan rendering bertahap. Dengan pendekatan ini, aplikasi dapat menampilkan data 3D secara interaktif melalui browser lokal.

## 4. Masalah yang Ingin Diselesaikan

Pengguna membutuhkan aplikasi sederhana untuk:

1. Mengunggah file point cloud.
2. Mengonversi file point cloud agar dapat dibaca viewer.
3. Menampilkan data 3D di browser.
4. Menguji workflow upload-to-viewer secara lokal.
5. Menjadi fondasi awal untuk pengembangan full stack yang lebih besar.

Tanpa aplikasi ini, pengguna harus menjalankan viewer dan converter secara manual, serta belum memiliki alur custom yang dapat dikembangkan menjadi platform sendiri.

## 5. Sasaran Pengguna

### 5.1 Pengguna Utama

Pengguna utama adalah developer atau mahasiswa yang ingin membangun platform visualisasi point cloud berbasis web.

### 5.2 Karakteristik Pengguna

Pengguna memiliki kebutuhan untuk:

* mencoba teknologi point cloud viewer,
* melakukan upload file 3D,
* melihat hasil visualisasi point cloud,
* memahami integrasi Potree dengan aplikasi web custom,
* membangun proof of concept sebelum masuk ke versi production.

## 6. Scope MVP

### 6.1 Termasuk dalam MVP

MVP mencakup:

1. Landing page sederhana.
2. Halaman upload file point cloud.
3. API upload berbasis Next.js Route Handler.
4. Validasi file `.las` dan `.laz`.
5. Penyimpanan file upload ke folder lokal.
6. Eksekusi PotreeConverter dari server-side Next.js.
7. Penyimpanan hasil konversi ke folder `public/pointclouds`.
8. Halaman viewer untuk membuka hasil konversi.
9. Integrasi Potree Viewer pada halaman viewer.
10. Handling status dasar: upload, converting, success, failed.
11. Tampilan informasi nama dataset dan path metadata.
12. Error message sederhana jika upload atau konversi gagal.

### 6.2 Tidak Termasuk dalam MVP

MVP tidak mencakup:

1. Database.
2. Login dan register.
3. Multi-user.
4. Supabase.
5. Cloud storage.
6. Background queue.
7. Deployment production.
8. Role admin.
9. Riwayat upload permanen berbasis database.
10. Support format selain `.las` dan `.laz`.
11. Edit point cloud.
12. Segmentasi point cloud.
13. Anotasi objek.
14. Kolaborasi real-time.
15. AI processing.
16. Optimasi untuk file sangat besar.

## 7. Definisi MVP Sukses

MVP dianggap berhasil jika:

1. User dapat membuka aplikasi di `localhost`.
2. User dapat mengunggah file `.las` atau `.laz`.
3. File berhasil disimpan di folder lokal.
4. PotreeConverter berhasil dijalankan dari aplikasi.
5. Hasil konversi muncul di folder `public/pointclouds/[dataset]`.
6. File `metadata.json` tersedia setelah konversi.
7. User diarahkan ke halaman viewer.
8. Point cloud tampil di browser.
9. User dapat melakukan navigasi dasar: rotate, zoom, dan pan.
10. Jika konversi gagal, aplikasi menampilkan pesan error yang jelas.

## 8. User Story

### 8.1 Upload Point Cloud

Sebagai pengguna, saya ingin mengunggah file point cloud agar file tersebut dapat dikonversi dan ditampilkan di browser.

Acceptance criteria:

* User dapat memilih file dari komputer.
* Sistem hanya menerima file `.las` atau `.laz`.
* Sistem menolak file dengan format lain.
* Sistem menampilkan status upload.
* Sistem menyimpan file ke folder lokal.

### 8.2 Konversi Point Cloud

Sebagai pengguna, saya ingin file yang saya upload dikonversi otomatis agar tidak perlu menjalankan PotreeConverter secara manual.

Acceptance criteria:

* Sistem menjalankan PotreeConverter setelah upload berhasil.
* Sistem membuat folder output berdasarkan nama dataset.
* Sistem menyimpan hasil konversi ke `public/pointclouds/[dataset]`.
* Sistem menampilkan error jika PotreeConverter gagal.
* Sistem tidak melanjutkan ke viewer jika `metadata.json` tidak ditemukan.

### 8.3 Menampilkan Point Cloud

Sebagai pengguna, saya ingin melihat hasil point cloud di browser agar dapat mengeksplorasi data 3D secara interaktif.

Acceptance criteria:

* Viewer membuka dataset berdasarkan parameter URL.
* Viewer membaca file `metadata.json`.
* Point cloud tampil di canvas.
* User dapat rotate, zoom, dan pan.
* Viewer menampilkan nama dataset.
* Viewer dapat reset view.

### 8.4 Melihat Daftar Dataset Lokal

Sebagai pengguna, saya ingin melihat dataset yang sudah berhasil dikonversi agar dapat membuka ulang hasil visualisasi sebelumnya.

Acceptance criteria:

* Sistem membaca daftar folder di `public/pointclouds`.
* Sistem hanya menampilkan folder yang memiliki `metadata.json`.
* User dapat klik dataset untuk membuka halaman viewer.

Fitur ini bersifat opsional untuk MVP awal, tetapi direkomendasikan karena membantu demo lokal.

## 9. Fitur Produk

## 9.1 Landing Page

### Deskripsi

Halaman awal aplikasi yang menjelaskan fungsi utama produk.

### Konten

* Nama aplikasi.
* Deskripsi singkat.
* Tombol ke halaman upload.
* Tombol ke halaman datasets jika fitur datasets dibuat.
* Informasi bahwa aplikasi berjalan lokal.

### Prioritas

Must-have.

---

## 9.2 Upload Page

### Deskripsi

Halaman untuk mengunggah file point cloud.

### Komponen UI

* Input file.
* Field nama dataset.
* Tombol upload.
* Informasi format yang didukung.
* Progress/status sederhana.
* Error message.
* Success message.
* Link ke viewer setelah berhasil.

### Validasi

* File wajib ada.
* Ekstensi file hanya `.las` atau `.laz`.
* Nama dataset tidak boleh kosong.
* Nama dataset perlu disanitasi agar aman sebagai nama folder.
* Jika nama dataset sudah ada, sistem dapat menambahkan timestamp otomatis.

### Prioritas

Must-have.

---

## 9.3 Upload API

### Endpoint

```text
POST /api/upload
```

### Tanggung Jawab

Endpoint ini menangani:

1. Menerima `multipart/form-data`.
2. Membaca file upload.
3. Membaca nama dataset.
4. Validasi format file.
5. Menyimpan file ke `storage/uploads`.
6. Membuat folder output di `public/pointclouds/[dataset]`.
7. Menjalankan PotreeConverter.
8. Mengecek hasil `metadata.json`.
9. Mengembalikan response JSON.

### Request

```text
Content-Type: multipart/form-data
```

Fields:

```text
file: File
datasetName: string
```

### Success Response

```json
{
  "success": true,
  "dataset": "living-room-20260609",
  "viewerUrl": "/viewer/living-room-20260609",
  "metadataUrl": "/pointclouds/living-room-20260609/metadata.json"
}
```

### Error Response

```json
{
  "success": false,
  "message": "File format tidak didukung. Gunakan .las atau .laz."
}
```

### Prioritas

Must-have.

---

## 9.4 Conversion Process

### Deskripsi

Proses konversi dilakukan setelah file berhasil disimpan. Sistem menjalankan binary PotreeConverter melalui server-side process.

### Input

```text
storage/uploads/[dataset]/original.las
```

atau:

```text
storage/uploads/[dataset]/original.laz
```

### Output

```text
public/pointclouds/[dataset]/
├── metadata.json
├── hierarchy.bin
├── octree.bin
└── log.txt
```

### Command Konseptual

```bash
./tools/PotreeConverter storage/uploads/[dataset]/original.las -o public/pointclouds/[dataset]
```

### Error Handling

Sistem harus menangani:

* PotreeConverter tidak ditemukan.
* File input tidak ditemukan.
* Format tidak valid.
* Proses conversion gagal.
* Output folder tidak terbentuk.
* `metadata.json` tidak ditemukan.
* Permission issue pada filesystem.

### Prioritas

Must-have.

---

## 9.5 Viewer Page

### Route

```text
/viewer/[dataset]
```

### Deskripsi

Halaman untuk menampilkan point cloud berdasarkan nama dataset.

### Alur

1. Ambil parameter `[dataset]` dari URL.
2. Bentuk path metadata:

```text
/pointclouds/[dataset]/metadata.json
```

3. Load Potree Viewer.
4. Jalankan `Potree.loadPointCloud`.
5. Tampilkan point cloud ke scene.

### Komponen UI

* Canvas viewer.
* Nama dataset.
* Tombol back.
* Tombol reset view.
* Panel kontrol sederhana.
* Status loading.
* Error jika metadata tidak ditemukan.

### Fitur Viewer Minimal

* Rotate.
* Zoom.
* Pan.
* Fit to screen.
* Point size default.
* Background default.
* Navigation control.

### Prioritas

Must-have.

---

## 9.6 Dataset List Page

### Route

```text
/datasets
```

### Deskripsi

Halaman opsional untuk membaca daftar dataset lokal dari folder `public/pointclouds`.

### Komponen UI

* List dataset.
* Nama dataset.
* Tombol open viewer.
* Indikator valid jika memiliki `metadata.json`.

### Prioritas

Should-have.

---

## 10. Arsitektur Sistem

## 10.1 Arsitektur MVP Lokal

```text
Browser
  |
  | Upload file
  v
Next.js Upload Page
  |
  | POST /api/upload
  v
Next.js Route Handler
  |
  | Save original file
  v
storage/uploads/
  |
  | Run PotreeConverter
  v
tools/PotreeConverter
  |
  | Generate converted output
  v
public/pointclouds/[dataset]/
  |
  | Load metadata.json
  v
Potree Viewer Page
  |
  | Render point cloud
  v
Browser 3D Viewer
```

## 10.2 Komponen Teknis

| Komponen      | Teknologi             | Fungsi                                |
| ------------- | --------------------- | ------------------------------------- |
| Frontend      | Next.js               | UI upload, landing, viewer            |
| Backend Lokal | Next.js Route Handler | API upload dan conversion trigger     |
| Viewer        | Potree Viewer         | Render point cloud                    |
| Converter     | PotreeConverter       | Konversi `.las/.laz` ke format Potree |
| Storage Lokal | Filesystem            | Menyimpan upload dan hasil convert    |
| Database      | Tidak digunakan       | Ditunda untuk fase berikutnya         |

## 11. Struktur Folder

```text
pointcloud-mvp/
├── public/
│   ├── potree/
│   │   ├── build/
│   │   ├── libs/
│   │   └── resources/
│   └── pointclouds/
│       └── .gitkeep
│
├── storage/
│   └── uploads/
│       └── .gitkeep
│
├── tools/
│   └── PotreeConverter
│
├── src/
│   └── app/
│       ├── page.tsx
│       ├── upload/
│       │   └── page.tsx
│       ├── datasets/
│       │   └── page.tsx
│       ├── viewer/
│       │   └── [dataset]/
│       │       └── page.tsx
│       └── api/
│           └── upload/
│               └── route.ts
│
├── package.json
├── next.config.ts
└── README.md
```

## 12. Data dan File Management

## 12.1 Upload File

File asli disimpan di:

```text
storage/uploads/[dataset]/original.las
```

atau:

```text
storage/uploads/[dataset]/original.laz
```

## 12.2 Converted File

Hasil konversi disimpan di:

```text
public/pointclouds/[dataset]/
```

## 12.3 Penamaan Dataset

Nama dataset perlu disanitasi.

Contoh input:

```text
Living Room Scan
```

Menjadi:

```text
living-room-scan-20260609-153000
```

Aturan sanitasi:

* lowercase,
* spasi menjadi `-`,
* karakter selain huruf, angka, dan dash dihapus,
* tambahkan timestamp untuk menghindari duplikasi.

## 13. Environment Variable

Untuk MVP lokal, environment variable minimal:

```env
POTREE_CONVERTER_PATH=./tools/PotreeConverter
UPLOAD_DIR=./storage/uploads
POINTCLOUD_OUTPUT_DIR=./public/pointclouds
NEXT_PUBLIC_POINTCLOUD_BASE_URL=/pointclouds
```

Catatan:

* Tidak perlu `DATABASE_URL`.
* Tidak perlu `SUPABASE_URL`.
* Tidak perlu `SUPABASE_ANON_KEY`.
* Tidak perlu `SUPABASE_SERVICE_ROLE_KEY`.

## 14. Functional Requirements

## 14.1 Upload

| ID     | Requirement                                  | Priority |
| ------ | -------------------------------------------- | -------- |
| FR-001 | User dapat memilih file `.las` atau `.laz`   | Must     |
| FR-002 | User dapat mengisi nama dataset              | Must     |
| FR-003 | Sistem menolak file selain `.las` dan `.laz` | Must     |
| FR-004 | Sistem menyimpan file ke folder lokal        | Must     |
| FR-005 | Sistem menampilkan status upload             | Must     |

## 14.2 Conversion

| ID     | Requirement                                                | Priority |
| ------ | ---------------------------------------------------------- | -------- |
| FR-006 | Sistem menjalankan PotreeConverter setelah upload berhasil | Must     |
| FR-007 | Sistem membuat folder output untuk dataset                 | Must     |
| FR-008 | Sistem mengecek keberadaan `metadata.json`                 | Must     |
| FR-009 | Sistem menampilkan error jika conversion gagal             | Must     |
| FR-010 | Sistem mengembalikan URL viewer jika conversion berhasil   | Must     |

## 14.3 Viewer

| ID     | Requirement                                            | Priority |
| ------ | ------------------------------------------------------ | -------- |
| FR-011 | Sistem membuka halaman viewer berdasarkan nama dataset | Must     |
| FR-012 | Sistem load file `metadata.json`                       | Must     |
| FR-013 | Sistem menampilkan point cloud                         | Must     |
| FR-014 | User dapat rotate, zoom, dan pan                       | Must     |
| FR-015 | User dapat reset view                                  | Should   |
| FR-016 | Sistem menampilkan error jika dataset tidak ditemukan  | Must     |

## 14.4 Dataset List

| ID     | Requirement                                                    | Priority |
| ------ | -------------------------------------------------------------- | -------- |
| FR-017 | Sistem dapat membaca daftar folder pointclouds lokal           | Should   |
| FR-018 | Sistem hanya menampilkan dataset yang memiliki `metadata.json` | Should   |
| FR-019 | User dapat membuka viewer dari daftar dataset                  | Should   |

## 15. Non-Functional Requirements

## 15.1 Performance

* File uji awal disarankan berukuran kecil sampai menengah.
* Target awal: file `.las/.laz` maksimal 50–100 MB untuk local MVP.
* Conversion boleh memakan waktu, tetapi sistem harus menampilkan status loading.
* Viewer harus tetap responsif setelah dataset berhasil dimuat.

## 15.2 Security

* Validasi ekstensi file wajib dilakukan.
* Nama file dan nama dataset harus disanitasi.
* Sistem tidak boleh menerima path traversal seperti `../../`.
* API tidak boleh mengeksekusi command berdasarkan input mentah user.
* Path PotreeConverter harus berasal dari environment variable atau konfigurasi tetap.
* File selain `.las` dan `.laz` harus ditolak.

## 15.3 Reliability

* Sistem harus mengecek apakah file upload benar-benar tersimpan.
* Sistem harus mengecek apakah conversion output berhasil dibuat.
* Sistem harus menangani error dari `child_process`.
* Sistem harus memberikan pesan error yang dapat dipahami.

## 15.4 Maintainability

* Logic upload dipisah dari logic conversion.
* Utility untuk sanitasi nama dataset dibuat terpisah.
* Utility untuk menjalankan PotreeConverter dibuat terpisah.
* Viewer component dibuat modular.
* Dokumentasi setup lokal harus tersedia di README.

## 16. UI/UX Requirements

## 16.1 Landing Page

Konten minimal:

```text
Local Point Cloud Viewer
Upload, convert, and view point cloud data locally with Potree.
```

Tombol:

* Upload Point Cloud
* View Datasets

## 16.2 Upload Page

State yang harus ada:

1. Idle.
2. File selected.
3. Uploading.
4. Converting.
5. Success.
6. Failed.

Contoh status:

```text
Uploading file...
Converting point cloud...
Conversion success. Open viewer.
Conversion failed. Please check your file.
```

## 16.3 Viewer Page

Layout:

```text
Top bar:
- Dataset name
- Back button
- Reset view button

Main:
- Potree canvas full screen

Optional side panel:
- Metadata URL
- Point size control
- Background toggle
```

## 17. Error Scenario

| Scenario                        | Expected Behavior                                      |
| ------------------------------- | ------------------------------------------------------ |
| File kosong                     | Tampilkan pesan “File wajib diunggah.”                 |
| Format salah                    | Tampilkan pesan “Gunakan file .las atau .laz.”         |
| PotreeConverter tidak ditemukan | Tampilkan pesan “PotreeConverter belum dikonfigurasi.” |
| Conversion gagal                | Tampilkan pesan error conversion.                      |
| Metadata tidak ditemukan        | Tampilkan pesan “metadata.json tidak ditemukan.”       |
| Dataset tidak ditemukan         | Tampilkan halaman error dataset.                       |
| Nama dataset invalid            | Sistem melakukan sanitasi otomatis.                    |

## 18. Technical Implementation Plan

## 18.1 Setup Potree Viewer

1. Clone repository Potree di luar project utama.
2. Build Potree.
3. Copy folder runtime yang diperlukan ke `public/potree`.
4. Pastikan file Potree dapat diakses dari browser.

## 18.2 Setup PotreeConverter

1. Download atau siapkan binary PotreeConverter.
2. Letakkan di folder `tools`.
3. Pastikan binary dapat dieksekusi.
4. Test manual dengan satu file `.las/.laz`.

## 18.3 Build Next.js App

1. Buat project Next.js.
2. Buat landing page.
3. Buat upload page.
4. Buat API route upload.
5. Buat viewer page.
6. Integrasikan Potree Viewer.

## 18.4 Integrasi Upload dan Convert

1. Upload file ke API route.
2. Simpan file lokal.
3. Jalankan PotreeConverter.
4. Simpan output ke `public/pointclouds`.
5. Return URL viewer.
6. Redirect user ke viewer.

## 19. Milestone

## Milestone 1 — Basic Project Setup

Output:

* Next.js project berjalan.
* Folder struktur tersedia.
* Potree runtime tersedia.
* PotreeConverter tersedia.

Acceptance:

* Aplikasi dapat dijalankan dengan `npm run dev`.

## Milestone 2 — Static Viewer

Output:

* Satu dataset hasil convert manual tersedia.
* Halaman viewer dapat menampilkan dataset tersebut.

Acceptance:

* `/viewer/sample` berhasil menampilkan point cloud.

## Milestone 3 — Upload API

Output:

* Halaman upload tersedia.
* API upload dapat menerima file.
* File tersimpan di `storage/uploads`.

Acceptance:

* File `.las/.laz` berhasil tersimpan.
* File selain `.las/.laz` ditolak.

## Milestone 4 — Auto Conversion

Output:

* API upload menjalankan PotreeConverter.
* Output masuk ke `public/pointclouds`.

Acceptance:

* Setelah upload, `metadata.json` berhasil dibuat.

## Milestone 5 — Upload to Viewer Flow

Output:

* Setelah conversion berhasil, user diarahkan ke viewer.

Acceptance:

* User dapat upload file dan langsung melihat point cloud di browser.

## Milestone 6 — Error Handling and Polish

Output:

* Error message lebih jelas.
* Loading state rapi.
* UI lebih siap untuk demo.

Acceptance:

* Error utama tertangani.
* Demo lokal berjalan stabil.

## 20. Testing Plan

## 20.1 Manual Test

Test case utama:

1. Upload file `.las` valid.
2. Upload file `.laz` valid.
3. Upload file `.txt`.
4. Upload tanpa file.
5. Upload dengan nama dataset kosong.
6. Upload file valid tetapi PotreeConverter path salah.
7. Buka viewer dataset valid.
8. Buka viewer dataset tidak valid.
9. Refresh halaman viewer.
10. Buka ulang dataset dari folder hasil convert.

## 20.2 Expected Result

* File valid berhasil dikonversi.
* File invalid ditolak.
* Viewer tampil untuk dataset valid.
* Error tampil untuk dataset invalid.
* Sistem tidak crash saat conversion gagal.

## 21. Risiko dan Mitigasi

| Risiko                                         | Dampak                     | Mitigasi                                 |
| ---------------------------------------------- | -------------------------- | ---------------------------------------- |
| PotreeConverter tidak kompatibel dengan OS     | Conversion gagal           | Sediakan binary sesuai OS                |
| File terlalu besar                             | Conversion lama atau gagal | Batasi ukuran file MVP                   |
| Vercel tidak cocok untuk conversion            | Deployment gagal           | Fokus local atau VPS                     |
| Runtime Potree sulit diintegrasikan ke Next.js | Viewer gagal tampil        | Mulai dari static viewer terlebih dahulu |
| Output tidak memiliki metadata.json            | Viewer gagal load          | Validasi output setelah conversion       |
| Path file bermasalah                           | File tidak ditemukan       | Gunakan path absolut di server-side      |

## 22. Batasan MVP

MVP ini hanya ditujukan untuk local proof of concept. Sistem belum dirancang untuk banyak user, file sangat besar, deployment serverless, penyimpanan cloud, atau penggunaan production.

Batasan utama:

* Hanya lokal.
* Tidak ada database.
* Tidak ada auth.
* Tidak ada cloud storage.
* Tidak ada background worker.
* Tidak ada queue.
* Tidak ada sistem retry.
* Tidak ada permission per user.
* Dataset disimpan sebagai folder lokal.
* Hanya support `.las` dan `.laz`.

## 23. Future Enhancement

Setelah MVP berhasil, pengembangan berikutnya:

1. Tambah database PostgreSQL atau Supabase.
2. Tambah Supabase Storage atau S3.
3. Tambah autentikasi user.
4. Tambah dataset metadata.
5. Tambah conversion job table.
6. Pisahkan worker conversion.
7. Tambah queue dengan Redis.
8. Deploy frontend dan backend.
9. Tambah support `.ply`, `.e57`, atau `.xyz`.
10. Tambah measurement tools.
11. Tambah clipping box.
12. Tambah screenshot export.
13. Tambah project management.
14. Tambah sharing link.
15. Tambah role admin.
16. Tambah progress conversion real-time.

## 24. Rekomendasi Scope Implementasi Pertama

Untuk implementasi pertama, urutan pengerjaan yang paling aman adalah:

```text
1. Static viewer dengan dataset hasil convert manual
2. Upload file ke folder lokal
3. Auto conversion dengan PotreeConverter
4. Redirect ke viewer
5. Dataset list lokal
6. UI polish
```

Jangan mulai dari upload dan conversion sebelum static viewer berhasil. Viewer adalah komponen paling penting. Jika viewer belum bisa membuka `metadata.json`, maka upload dan conversion belum perlu dikerjakan lebih jauh.

## 25. Kesimpulan

Produk ini adalah MVP lokal untuk membuktikan workflow upload, konversi, dan visualisasi point cloud berbasis web. Next.js digunakan sebagai aplikasi full stack lokal, Potree Viewer digunakan untuk rendering 3D, dan PotreeConverter digunakan untuk menghasilkan format point cloud yang dapat dibaca oleh viewer.

Target utama MVP adalah:

```text
Upload .las/.laz → Convert → Load metadata.json → Tampilkan 3D point cloud
```

Jika alur ini berhasil, produk dapat dilanjutkan ke versi full stack production dengan database, storage cloud, user management, background worker, dan deployment.
