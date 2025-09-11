# อัลกุรอาน - เว็บแอปพลิเคชันฟังอัลกุรอาน

<div align="center">

![Quran App](public/favicon.ico)

**เว็บแอปพลิเคชันฟังอัลกุรอานออนไลน์พร้อมคำแปลภาษาไทย**

[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare-orange)](https://quran.in.th)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.1.1-00DC82)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)

[🌐 เยี่ยมชมเว็บไซต์](https://quran.in.th) • [📖 เอกสาร](./claudedocs/) • [🐛 รายงานปัญหา](https://github.com/ninearif/quran-th/issues)

</div>

## 📖 เกี่ยวกับโครงการ

เว็บแอปพลิเคชันฟังอัลกุรอานออนไลน์ที่ออกแบบมาเพื่อให้ผู้ใช้ชาวไทยสามารถฟังการอ่านอัลกุรอานได้อย่างสะดวกและสวยงาม พร้อมด้วยการออกแบบที่ตอบสนอง (Responsive Design) สำหรับทั้งมือถือและเดสก์ท็อป

### ✨ คุณสมบัติหลัก

- 🎵 **เสียงคุณภาพสูง** - การอ่านอัลกุรอานโดย Saʻad al-Ghāmidī พร้อมคำแปลภาษาไทยโดย อ.บรรจง โซ๊ะมณี
- 📱 **ออกแบบตอบสนอง** - ใช้งานได้ลื่นไหลทั้งบนมือถือและเดสก์ท็อป
- 🎪 **เล่นอัตโนมัติ** - เล่นซูเราะฮฺถัดไปอัตโนมัติ พร้อมโหมดวนซ้ำ
- 🌙 **โหมดมืด/สว่าง** - เปลี่ยนธีมได้ตามความต้องการ
- 📴 **เล่นเบื้องหลัง** - รองรับการเล่นเสียงเบื้องหลังด้วย Media Session API
- ⚡ **โหลดเร็ว** - ใช้ Howler.js สำหรับการสตรีมมิงเสียงที่เสถียร
- 🔄 **ระบบกู้คืน** - กู้คืนการเล่นอัตโนมัติเมื่อเกิดปัญหาเครือข่าย

### 🏗️ เทคโนโลยีที่ใช้

- **Frontend**: [Nuxt 4](https://nuxt.com/) + [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [Nuxt UI](https://ui.nuxt.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Audio Engine**: [Howler.js](https://howlerjs.com/) สำหรับการสตรีมมิงเสียงที่เชื่อถือได้
- **Deployment**: [Cloudflare Workers](https://workers.cloudflare.com/) + [R2 Storage](https://developers.cloudflare.com/r2/)
- **Build Tool**: [Vite](https://vitejs.dev/)

## 🚀 การเริ่มต้นใช้งาน

### ความต้องการระบบ

- Node.js 18+ 
- npm หรือ yarn
- Cloudflare account (สำหรับ deployment)

### การติดตั้งในเครื่อง

1. **Clone โปรเจค**
```bash
git clone https://github.com/ninearif/quran-th.git
cd quran-th
```

2. **ติดตั้ง dependencies**
```bash
npm install
```

3. **รันเซิร์ฟเวอร์สำหรับพัฒนา**
```bash
npm run dev
```

4. **เปิดเบราว์เซอร์** ไปที่ `http://localhost:3000`

## 🤝 การร่วมพัฒนา

เรายินดีสำหรับการมีส่วนร่วมจากชุมชนนักพัฒนา 

### แนวทางการเขียนโค้ด

- ใช้ TypeScript สำหรับ type safety
- เขียน commit message ตามแนวทางของ [Conventional Commits](https://www.conventionalcommits.org/)
- เขียน commit message เป็นภาษาอังกฤษ
- ทำการทดสอบให้ครบถ้วนก่อน submit PR
- เขียนตาม convention และ code style ที่มีอยู่ในโปรเจค

### ประเภทการมีส่วนร่วม

- 🐛 **แก้ไขบัก** - รายงานหรือแก้ไขปัญหาที่พบ
- ✨ **เพิ่มคุณสมบัติ** - เสนอหรือพัฒนาฟีเจอร์ใหม่
- 📝 **ปรับปรุงเอกสาร** - แก้ไขหรือเพิ่มเติมเอกสาร
- 🎨 **ปรับปรุง UI/UX** - ทำให้แอปสวยงามและใช้งานง่ายขึ้น
- 🌐 **แปลภาษา** - ช่วยแปลเป็นภาษาอื่นๆ
- 🔊 **เนื้อหาเสียง** - เสนอแนะผู้อ่านหรือคุณภาพเสียงใหม่

### การรายงานปัญหา

หากพบปัญหาการใช้งาน กรุณา:

1. เช็คว่ามีคนรายงานปัญหาเดียวกันแล้วหรือไม่ใน [Issues](https://github.com/ninearif/quran-th/issues)
2. หากยังไม่มี ให้สร้าง issue ใหม่พร้อมรายละเอียด:
   - อธิบายปัญหาที่เกิดขึ้น
   - ขั้นตอนการทำให้เกิดปัญหาซ้ำ
   - เบราว์เซอร์และ OS ที่ใช้
   - Screenshot (หากมี)

## 📁 โครงสร้างโปรเจค

```
quran-th/
├── app/                    # แอปพลิเคชันหลัก
│   ├── components/         # Vue components
│   ├── composables/        # Vue composables
│   ├── pages/             # หน้าเว็บ
│   ├── services/          # บริการต่างๆ
│   └── types/             # TypeScript types
├── public/                # ไฟล์ static
├── server/                # Server-side API
├── wrangler.jsonc        # Cloudflare Workers config
└── nuxt.config.ts        # Nuxt configuration
```

## 📜 License

โปรเจคนี้เผยแพร่ภายใต้ MIT License - ดู [LICENSE](LICENSE) สำหรับรายละเอียด

## 📞 ติดต่อ

- **เว็บไซต์**: [https://quran.in.th](https://quran.in.th)
- **GitHub Issues**: [รายงานปัญหา](https://github.com/ninearif/quran-th/issues)
- **Email**: [ติดต่อผู้พัฒนา](mailto:contact@quran.in.th)

---

