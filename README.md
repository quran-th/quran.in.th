# quran.in.th - ฟังอัลกุรอานพร้อมความหมายภาษาไทย

เว็บแอปพลิเคชันฟังอัลกุรอานที่ทันสมัยและรองรับการใช้งานบนอุปกรณ์ต่างๆ พร้อมเสียงอ่านความหมายภาษาไทย

[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare-orange)](https://quran.in.th)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.1.1-00DC82)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)

## เริ่มต้นใช้งาน

```bash
git clone https://github.com/ninearif/quran-th.git
cd quran-th
npm install
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

## สถาปัตยกรรมระบบ

### Tech Stack
- **Framework**: Nuxt 4 (Vue 3 + TypeScript)
- **UI**: Nuxt UI + Tailwind CSS
- **Audio**: Howler.js + Media Session API
- **Deployment**: Cloudflare Workers + R2 Storage
- **Build**: Vite + Nitro

### คุณสมบัติหลัก
- 🎵 ระบบเสียงขั้นสูงด้วย Howler.js
- 📱 รองรับการใช้งานบนมือถือและเดสก์ท็อป (responsive design)
- 🌐 รองรับภาษาไทยอย่างสมบูรณ์
- ⚡ ปรับแต่งสำหรับ Cloudflare Workers edge deployment
- 📻 ควบคุมเสียงแบบ native ผ่าน Media Session API
- 📴 Progressive Web App

## โครงสร้างโปรเจค

```
quran-th/
├── app/                           # แอปพลิเคชันหลัก
│   ├── app.vue                   # component หลัก
│   ├── pages/index.vue           # หน้าหลักที่รองรับ responsive
│   ├── components/               # Vue components แบบ modular
│   │   ├── headers/              # header สำหรับแต่ละ platform
│   │   ├── layouts/              # การจัดเรียง layout
│   │   ├── player/               # component ควบคุมการเล่นเสียง
│   │   ├── ui/                   # UI elements ที่ใช้ซ้ำได้
│   │   └── modals/               # modal สำหรับการตั้งค่า
│   ├── composables/              # logic ทางธุรกิจ (Composition API)
│   │   ├── useAudioPlayer.ts     # การจัดการเสียงหลัก
│   │   ├── useLocalStorage.ts    # การจัดการ state แบบถาวร
│   │   ├── useReciters.ts        # การจัดการข้อมูลผู้อ่าน
│   │   └── useSurahs.ts          # การจัดการข้อมูลซูเราะฮฺ
│   ├── types/quran.ts            # TypeScript interfaces
│   └── data/                     # ข้อมูลคงที่และ metadata
├── public/                       # ไฟล์ static
│   ├── audio/                    # ไฟล์เสียงสำหรับ local dev
│   ├── fonts/                    # ไฟล์ฟอนต์ภาษาไทย
│   └── *.png                     # ไอคอน PWA และรูปภาพ
├── server/                       # Server-side API
│   └── api/                      # API endpoints
│       ├── audio/[reciterId]/[id].get.ts    # การสตรีมเสียง
│       └── surahs/[reciterId].get.ts        # Metadata API
├── nuxt.config.ts                # การตั้งค่าหลัก
├── wrangler.jsonc                # การตั้งค่า Cloudflare Workers
└── docs/knowledge-base/          # เอกสารทางเทคนิค
```

## การตั้งค่าสำหรับการพัฒนา

### ข้อกำหนดเบื้องต้น
- Node.js 18+
- npm or yarn
- Git

### การพัฒนาในเครื่อง

```bash
# ติดตั้ง dependencies
npm install

# เริ่ม development server พร้อมไฟล์เสียง local
npm run dev

# เริ่มด้วย Cloudflare Workers environment
npm run dev:cf

# build สำหรับ production
npm run build

# ดูตัวอย่าง production build
npm run preview
```

### การตั้งค่าการพัฒนาระบบเสียง

**โหมดการพัฒนาในเครื่อง:**
- ใช้ไดเรกทอรี่ `public/audio/` อัตโนมัติ
- ไม่ต้องพึ่งพาระบบภายนอก
- เหมาะสำหรับทดสอบไฟล์เสียงใหม่

**โหมด Production:**
- สตรีมจาก Cloudflare R2 Storage
- Environment variable: `USE_LOCAL_AUDIO=false`

### Environment Variables

| Variable | Development | Production | คำอธิบาย |
|----------|-------------|------------|-------------|
| `USE_LOCAL_AUDIO` | `true` (auto) | `false` | เปลี่ยนระหว่างไฟล์เสียง local กับ R2 |
| `NODE_ENV` | `development` | `production` | สภาพแวดล้อมการทำงาน |

## คำสั่งสำหรับการพัฒนา

```bash
npm run dev          # Local development server
npm run dev:cf       # Cloudflare Workers local environment
npm run build        # Production build
npm run preview      # Build + preview ด้วย Wrangler
npm run deploy       # Build + deploy ไปยัง Cloudflare
npm run cf-typegen   # สร้าง Cloudflare types
npm run lint         # ตรวจสอบ ESLint
npm run lint:fix     # แก้ไข ESLint อัตโนมัติ
npm run typecheck    # ตรวจสอบ TypeScript
npm run release      # Semantic release
```

## สถาปัตยกรรม Component

### Responsive Strategy
- **Mobile (`< 768px`)**: Circular player + tab navigation
- **Desktop (`>= 768px`)**: Large player + table layout
- **Breakpoint**: `md:` (768px) throughout codebase

### Key Components
- **`MobilePlayer.vue`**: Compact circular audio controls
- **`DesktopPlayer.vue`**: Full-featured player interface
- **`SurahCardList.vue`**: Scrollable surah selection
- **`useAudioPlayer.ts`**: Core audio state management

### State Management
- **Composition API**: All logic in composables
- **useState**: Global reactive state
- **localStorage**: Persistent user preferences
- **Media Session API**: Native audio controls

## Contributing Guidelines

### มาตรฐานการเขียนโค้ด
- **TypeScript**: เปิดใช้งาน strict mode
- **ESLint**: ใช้การตั้งค่า `@nuxt/eslint`
- **Commit Style**: Conventional Commits
- **Testing**: ทดสอบข้ามเบราว์เซอร์ด้วยตนเอง

### ขั้นตอนการมีส่วนร่วม

1. **Fork & Clone**
   ```bash
   git clone https://github.com/yourusername/quran-th.git
   ```

2. **สร้าง Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **การพัฒนา**
   - ทำตามรูปแบบโค้ดที่มีอยู่
   - ใช้ TypeScript interfaces จาก `types/quran.ts`
   - ทดสอบบนมือถือ (< 768px) และเดสก์ท็อป (>= 768px)
   - ตรวจสอบการทำงานของเสียงด้วยไฟล์ local

4. **การตรวจสอบคุณภาพ**
   ```bash
   npm run lint        # ตรวจสอบ code style
   npm run typecheck   # ตรวจสอบ type
   npm run build       # ตรวจสอบ build
   ```

5. **ส่ง PR**
   - ใส่คำอธิบายที่ชัดเจน
   - อ้างอิง issues ที่เกี่ยวข้อง
   - ใส่หมายเหตุการทดสอบ

### แนวทางการพัฒนา

**การสร้าง Component:**
- วางใน subdirectory ที่เหมาะสม (`ui/`, `player/`, etc.)
- ใช้รูปแบบ `<script setup lang="ts">`
- import types จาก `~/types/quran`
- ทำตามรูปแบบ responsive design

**การพัฒนาระบบเสียง:**
- ทดสอบด้วยไฟล์ `public/audio/` ใน local
- ตรวจสอบการสตรีมจาก R2 ใน production
- ใช้ `useAudioPlayer()` composable สำหรับ state
- เพิ่มการจัดการ error ที่เหมาะสม

**การจัดแต่งสไตล์:**
- ใช้ Tailwind CSS classes
- ทำตามแนวทาง mobile-first responsive
- รักษาความเข้ากันได้ของธีมมืด/สว่าง
- ใช้ฟอนต์ไทยจาก `public/fonts/`

## คุณสมบัติพิเศษสำหรับการพัฒนา

### การทดสอบเสียงใน Local
```bash
# วางไฟล์เสียงใน public/audio/[reciterId]/[surahId].mp3
mkdir -p public/audio/001
# คัดลอกไฟล์ MP3 ทดสอบไปยัง public/audio/001/001.mp3, etc.
npm run dev  # ใช้ไฟล์ local อัตโนมัติ
```

### การพัฒนา PWA
- Service worker สร้างอัตโนมัติผ่าน Vite PWA
- Manifest: `public/manifest.json`
- ตั้งค่ากลยุทธ์การแคชเสียงแล้ว
- รองรับการเล่นเสียงเบื้องหลัง

### การพัฒนาด้วย Cloudflare
```bash
npm run dev:cf  # สภาพแวดล้อม Workers ใน local
npm run cf-typegen  # สร้าง R2 types
```

## การรายงานปัญหา

**ก่อนรายงาน:**
1. ตรวจสอบ [issues](https://github.com/ninearif/quran-th/issues) ที่มีอยู่แล้ว
2. ทดสอบบนหลายเบราว์เซอร์/อุปกรณ์
3. ตรวจสอบการทำงานของเสียง

**ข้อมูลที่ควรระบุ:**
- รายละเอียดเบราว์เซอร์และ OS
- ขั้นตอนการทำให้เกิดปัญหาซ้ำ
- พฤติกรรมการเล่นเสียง
- สภาพเครือข่าย (ถ้าเกี่ยวข้อง)
- ข้อผิดพลาด console (ถ้ามี)

## ลิขสิทธิ์

MIT License - ดูรายละเอียดที่ [LICENSE](LICENSE)

## ลิงก์ที่เกี่ยวข้อง

- **เว็บแอป**: [quran.in.th](https://quran.in.th)
- **รายงานปัญหา**: [GitHub Issues](https://github.com/ninearif/quran-th/issues)
- **เอกสาร**: [Knowledge Base](docs/knowledge-base/)
