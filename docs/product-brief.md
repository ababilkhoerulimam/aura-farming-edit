# Product brief — Aura meme generator

_Dokumen keputusan Fase 0 untuk mengunci konsep, layout, output, dan batasan MVP._

---

## 📋 Product definition

**Nama kerja:** Aura Meme Generator

**One-liner:** Ambil foto dari webcam, ubah menjadi meme edit bergaya sigma/aura farming, dan tampilkan hasilnya langsung di panel sebelah.

**Input utama:** Satu frame dari webcam.

**Output utama:** Satu gambar meme komposit.

**Target pengguna:** Orang yang ingin membuat foto meme cepat tanpa aplikasi editing manual.

## 🎯 Product promise

Dalam satu interaksi capture, pengguna dapat melihat foto asli dan hasil edit meme secara berdampingan. Hasil pertama harus terasa instan, visual, dan mudah diunduh.

## 🖥️ Layout yang dikunci untuk MVP

~~~text
┌─────────────────────────────────────────────────────────────┐
│ Aura Meme Generator                         [Template ▼]    │
├──────────────────────────────┬──────────────────────────────┤
│                              │                              │
│         LIVE CAMERA          │         EDITED RESULT        │
│                              │                              │
│     [face guide optional]    │       [meme composite]       │
│                              │                              │
├──────────────────────────────┴──────────────────────────────┤
│ [Capture photo]     [Retake]     [Download image]           │
└─────────────────────────────────────────────────────────────┘
~~~

**Panel kiri — input:**

- Menampilkan webcam secara live
- Menampilkan status kamera
- Menampilkan face guide atau bounding box jika detection aktif
- Menjadi sumber frame saat capture

**Panel kanan — output:**

- Menampilkan placeholder sebelum capture
- Menampilkan loading state saat compositing
- Menampilkan hasil edit setelah selesai
- Tidak menimpa live camera

**Toolbar bawah:**

- Tombol utama Capture photo
- Tombol Retake setelah hasil tersedia
- Tombol Download image setelah hasil tersedia
- Tombol Turn camera off sebagai kontrol tambahan

## 📐 Output spec

| Properti | Keputusan MVP |
| --- | --- |
| Output type | Static image |
| Default canvas | 1080 × 1080 |
| Aspect ratio | 1:1 |
| Format download | PNG |
| Preview | Responsive, menjaga aspect ratio |
| Color space | sRGB |
| Face count | Satu wajah utama |
| Orientation | Mirror preview, non-mirror output secara default |
| Maximum input | Disarankan tidak lebih dari 10 MB setelah decode |

Ukuran 1:1 dipilih sebagai titik awal karena template dapat menempatkan foto utama dan asset pembanding dalam satu komposisi yang seimbang. Dukungan 9:16 dan 16:9 ditunda ke fase template library.

## 🧩 Template pertama yang dikunci

**ID:** sigma_split_01

**Nama tampilan:** Sigma Split

**Konsep:** Foto pengguna berada di sisi kiri, character atau reaction asset berada di sisi kanan, dengan label pendek atau punchline di bagian bawah.

**Komposisi:**

- Background gelap
- Foto pengguna menempati sekitar 50% canvas
- Asset pembanding menempati sekitar 35–40% canvas
- Area teks aman di bagian bawah
- Red accent sebagai warna punchline
- Vignette dan contrast tinggi
- Tidak menggunakan animasi pada MVP foto

**Contoh layer:**

1. Background hitam gelap
2. Foto pengguna dengan crop wajah
3. Gradient pemisah antar panel
4. Character atau reaction PNG
5. Shadow atau glow tipis
6. Teks AURA atau caption custom
7. Border tipis

## 🎨 Visual identity awal

| Elemen | Nilai awal |
| --- | --- |
| Background | #0B0B0F |
| Surface | #17171D |
| Primary text | #F5F5F5 |
| Muted text | #A1A1AA |
| Accent red | #EF233C |
| Accent cyan | #00D9FF |
| Border | #2A2A35 |
| Font heading | Impact-like bold fallback |
| Font body | Inter/system sans-serif |
| Radius | 12–16 px |
| Style | Dark, compact, high contrast |

## 📦 Asset inventory Fase 0

Asset yang perlu tersedia untuk satu template pertama:

| Kategori | Jumlah minimum | Status |
| --- | ---: | --- |
| Background gelap | 1 | CSS/Canvas |
| Character/reaction PNG | 1 | Perlu disediakan |
| Optional texture | 1 | Bisa dibuat procedural |
| Font heading | 1 | Legal atau system fallback |
| Font body | 1 | System sans-serif |
| Glow/gradient | 1 | Canvas |
| Border/frame | 1 | Canvas |
| Watermark | 0 | Ditunda |

**Aturan asset:** Jangan memasukkan screenshot atau potongan film berhak cipta ke repository sebelum lisensinya jelas. Untuk prototipe, gunakan asset original, placeholder, atau asset yang memang diizinkan.

## 🔐 Privasi MVP

- Kamera aktif setelah pengguna memberi izin
- Frame diproses lokal di browser
- Tidak ada upload otomatis
- Tidak ada penyimpanan permanen
- Face detection hanya untuk posisi/crop
- Tidak ada identifikasi nama atau pencocokan identitas

## ✅ Definition of done Fase 0

- [x] Konsep produk ditulis
- [x] Layout dua panel dikunci
- [x] Output default ditentukan
- [x] Template pertama ditentukan
- [x] Visual identity awal ditentukan
- [x] Daftar asset dibuat
- [x] Batasan MVP ditentukan
- [ ] Asset character/reaction final disediakan
- [ ] Nama produk final dikonfirmasi

## 📌 Keputusan yang masih reversible

- Nama final aplikasi
- Character/reaction asset
- Teks default
- Pilihan font
- Dukungan aspect ratio tambahan
- Mirror atau non-mirror output
- Template random atau template terpilih

---

_Status: Fase 0 siap dilanjutkan ke implementasi Fase 1._

