# Local Point Cloud Viewer

MVP lokal untuk upload, convert, dan view point cloud dengan Next.js, Potree Viewer, dan PotreeConverter. Aplikasi ini tidak memakai database, auth, cloud storage, atau queue; semua data disimpan di filesystem lokal.

## Fitur

- Landing page lokal.
- Upload `.las`, `.laz`, `.e57`, `.ply`, `.pts`, atau `.xyz` dengan nama dataset.
- `POST /api/upload` untuk menyimpan file dan menjalankan PotreeConverter.
- Output konversi di `public/pointclouds/[dataset]`.
- Viewer Potree di `/viewer/[dataset]`.
- Dataset list lokal di `/datasets`, hanya untuk folder yang punya `metadata.json`.

## Struktur Lokal

```text
public/
  potree/              # runtime Potree hasil build, ignored
  pointclouds/         # output conversion, ignored kecuali .gitkeep
storage/
  uploads/             # file upload asli, ignored kecuali .gitkeep
tools/
  PotreeConverter      # binary lokal, ignored
  liblaszip.dylib      # dependency binary macOS, ignored
```

## Environment

Default aplikasi sudah mengikuti PRD:

```env
POTREE_CONVERTER_PATH=./tools/PotreeConverter
UPLOAD_DIR=./storage/uploads
POINTCLOUD_OUTPUT_DIR=./public/pointclouds
NEXT_PUBLIC_POINTCLOUD_BASE_URL=/pointclouds
MAX_UPLOAD_MB=1024
PDAL_PATH=pdal
```

Env var hanya diperlukan kalau path lokal atau limit upload ingin diganti. Untuk upload 700 MB+, default `MAX_UPLOAD_MB=1024` sudah cukup; naikkan nilai ini jika file lebih besar dari 1 GB.

Format `.las` dan `.laz` langsung masuk PotreeConverter. Format `.e57`, `.ply`, `.pts`, dan `.xyz` dikonversi dulu menjadi `prepared.laz` dengan PDAL, lalu masuk PotreeConverter.

## Development

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Verifikasi

```bash
npm test
npm run lint
npm run build
```

## Catatan Potree

Runtime Potree 1.8.2 dibuild dari source dan disalin ke `public/potree`. Folder ini di-ignore karena berisi artifact eksternal hasil build.

PotreeConverter 2.1.1 tidak menyediakan release binary macOS arm64. Binary lokal di `tools/PotreeConverter` dibuild dari source dengan CMake dan TBB. Pada macOS, binary juga membutuhkan `tools/liblaszip.dylib` dan Homebrew TBB di `/opt/homebrew/opt/tbb`.
