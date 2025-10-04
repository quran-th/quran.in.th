# quran.in.th - ฟังอัลกุรอานพร้อมความหมายภาษาไทย

เว็บแอปพลิเคชันฟังอัลกุรอานที่ทันสมัยและรองรับการใช้งานบนอุปกรณ์ต่างๆ พร้อมเสียงอ่านความหมายภาษาไทย

Modern Quran audio player application with comprehensive Thai language support, built with Nuxt 4 and Vue 3.

[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare-orange)](https://quran.in.th)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.1.1-00DC82)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)

## 🚀 Quick Start

```bash
git clone https://github.com/ninearif/quran-th.git
cd quran-th
npm install
npm run seed:r2      # Seed local R2 bucket with audio files
npm run dev          # Start development server
```

Open `http://localhost:3000` in your browser.

> **Note**: This project uses Cloudflare R2 for audio storage. The development server automatically provides local R2 emulation through Nitro. The `seed:r2` command populates your local R2 bucket with sample audio files.

> **Development Audio**: The local development environment includes sample audio for 4 surahs only (for both reciters):
> - Surah 1: อัล-ฟาติฮะฮ์ (Al-Fatihah)
> - Surah 112: อัล-อิคลาศ (Al-Ikhlas)
> - Surah 113: อัล-ฟะลัก (Al-Falaq)
> - Surah 114: อัน-นาส (An-Nas)

## 📖 Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Complete guide for contributors (development setup, code standards, workflow)
- **[Knowledge Base](docs/knowledge-base/)** - Technical documentation and architecture guides
- **[CLAUDE.md](CLAUDE.md)** - Project overview and development guidance

## ✨ Features

- 🎵 **Advanced Audio Streaming** - Howler.js engine with Media Session API integration
- 📱 **Responsive Design** - Mobile circular player + desktop table layouts
- 🌐 **Thai Language Support** - Complete localization with custom InterThaiLoopless fonts
- ⚡ **Edge Optimized** - Cloudflare Workers deployment for global performance
- 📻 **Native Controls** - Lock screen and notification center audio controls
- 📴 **Progressive Web App** - Offline capabilities and installable experience

## 🛠️ Tech Stack

- **Framework**: Nuxt 4 with Vue 3 Composition API + TypeScript
- **UI**: Nuxt UI + Tailwind CSS with custom Thai font integration
- **Audio**: Howler.js + Media Session API for cross-platform compatibility
- **Deployment**: Cloudflare Workers + R2 Storage for edge delivery
- **Build**: Vite + Nitro with tree-shaking and optimization

## 📁 Project Structure

```
app/components/          # 20+ modular Vue components
├── headers/            # Platform-specific headers
├── layouts/            # Layout orchestration
├── player/             # Audio player components
├── ui/                 # Reusable UI elements
└── modals/             # Configuration modals

app/composables/        # Business logic composables
├── useAudioPlayer.ts   # Core audio state management
├── useReciters.ts      # Reciter data management
└── useSurahs.ts        # Surah data and filtering

server/api/             # Edge API endpoints
├── audio/              # Audio streaming with R2
└── surahs/             # Metadata endpoints

docs/knowledge-base/    # Comprehensive documentation
```

For detailed architecture and component documentation, see **[Knowledge Base](docs/knowledge-base/)**.

## 🤝 Contributing

We welcome contributions! Please see **[CONTRIBUTING.md](CONTRIBUTING.md)** for:

- 🛠️ **Development Environment Setup** - Node.js 20+, dependencies, local configuration
- 📏 **Code Standards** - TypeScript, Vue 3 Composition API, ESLint rules
- 🔄 **Development Workflow** - Git flow, conventional commits, automated validation
- 🧪 **Testing Guidelines** - Cross-browser testing, mobile/desktop validation
- 📝 **Pull Request Process** - PR template, automated checks, review workflow

### Quick Development Commands

```bash
npm run dev          # Start development server
npm run seed:r2      # Seed local R2 bucket with audio files
npm run build        # Production build
npm run lint         # Code quality checks
npm run typecheck    # TypeScript validation
```

> **Development Note**: The `dev` command uses Nitro server with automatic R2 emulation. Your local environment automatically matches production behavior.

## 🐛 Issues & Support

Found a bug or have a feature request?

1. **Check existing [issues](https://github.com/quran-th/quran.in.th/issues)** first
2. **Test across browsers/devices** for reproduction
3. **Include details**: Browser, OS, steps to reproduce, console errors
4. **For audio issues**: Test both local and production environments

## 🚀 Deployment

The application automatically deploys to Cloudflare Workers using semantic-release:

- **Automatic versioning** based on conventional commits
- **Changelog generation** with release notes
- **Edge deployment** for global performance
- **GitHub releases** with build artifacts

For development details, see **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## 📜 License

MIT License - See [LICENSE](LICENSE) for details.

## 🔗 Links

- **🌐 Live App**: [quran.in.th](https://quran.in.th)
- **🐛 Issues**: [GitHub Issues](https://github.com/quran-th/quran.in.th/issues)
- **🤝 Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **📖 Documentation**: [Knowledge Base](docs/knowledge-base/)

---
