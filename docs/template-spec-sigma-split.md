# Template specification — Sigma Split

> ⚠️ **Deprecated direction:** The static Sigma Split image template is not part of the active Python desktop implementation. See the [Python desktop instant-edit plan](python-desktop-plan.md).

_Spesifikasi template pertama untuk Aura Meme Generator._

---

## 📋 Metadata

| Field | Value |
| --- | --- |
| Template ID | sigma_split_01 |
| Display name | Sigma Split |
| Canvas | 1080 × 1080 |
| Output | PNG |
| Primary subject | Foto pengguna |
| Secondary subject | Character/reaction asset |
| Default caption | AURA |
| Processing mode | Client-side |

## 🧱 Layer composition

~~~text
Layer 7  — Border/frame
Layer 6  — Caption and label
Layer 5  — Glow, shadow, grain
Layer 4  — Character/reaction asset
Layer 3  — Split gradient
Layer 2  — User photo crop
Layer 1  — Dark background
~~~

## 📍 Layout coordinates

Canvas menggunakan sistem koordinat dengan titik awal di kiri atas.

| Area | X | Y | Width | Height |
| --- | ---: | ---: | ---: | ---: |
| User photo | 0 | 0 | 540 | 1080 |
| Asset panel | 540 | 0 | 540 | 900 |
| Caption safe area | 0 | 860 | 1080 | 220 |
| Main caption | 540 | 930 | 900 | 100 |

Koordinat adalah baseline prototipe dan dapat dituning setelah asset pertama dipasang.

## 🎨 Visual treatment

- User photo: crop cover, contrast tinggi, sedikit desaturasi
- Asset panel: contain atau cover sesuai rasio asset
- Background: hitam gelap
- Split gradient: transparan ke hitam
- Caption: uppercase, tebal, putih atau merah
- Accent: merah untuk kata utama
- Effect: vignette dan glow tipis
- Border: garis tipis dengan opacity rendah

## ⚙️ Input behavior

- Jika satu wajah ditemukan, crop diarahkan ke titik tengah wajah
- Jika tidak ada wajah, gunakan crop tengah
- Jika lebih dari satu wajah, gunakan wajah dengan bounding box terbesar
- Jika foto landscape, crop mengikuti safe area tanpa memotong wajah
- Jika kamera mirror, preview boleh mirror tetapi hasil default non-mirror

## ✅ Template acceptance criteria

- [ ] Template dapat dirender tanpa error dengan foto 1:1
- [ ] Template dapat dirender tanpa error dengan foto portrait
- [ ] Wajah utama tidak terpotong pada posisi normal
- [ ] Asset pembanding terlihat jelas
- [ ] Caption tidak keluar dari canvas
- [ ] Hasil tetap terbaca pada layar kecil
- [ ] Hasil dapat diekspor sebagai PNG
- [ ] Fallback crop bekerja tanpa face detection
- [ ] Semua asset memiliki placeholder jika asset final belum tersedia

## 🧪 Test fixtures

Siapkan minimal empat fixture lokal:

1. Wajah di tengah dengan pencahayaan baik
2. Wajah agak ke kiri
3. Wajah agak ke kanan
4. Foto tanpa wajah

Hasil setiap fixture dibandingkan secara visual untuk memastikan positioning template konsisten.

---

_Status: Template spec awal · Menunggu asset character/reaction final._
