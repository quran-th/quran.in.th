# Contributing to Quran-TH

ยินดีต้อนรับสู่โปรเจค Quran-TH! เราขอขอบคุณที่คุณสนใจจะมาร่วมพัฒนาแอปพลิเคชันฟังอัลกุรอานที่ทันสมัยและครอบคลุมการสนับสนุนภาษาไทยอย่างสมบูรณ์

Welcome to the Quran-TH project! We appreciate your interest in contributing to our modern Quran audio player application with comprehensive Thai language support.

## 🎯 Project Overview

Quran-TH is a responsive, progressive web application built with Nuxt 4 and Vue 3 that provides:

- 🎵 Advanced audio streaming with Howler.js
- 📱 Responsive design (mobile circular + desktop table layouts)
- 🌐 Full Thai language localization with custom fonts
- ⚡ Edge-optimized deployment on Cloudflare Workers
- 📻 Native audio controls via Media Session API
- 📴 Progressive Web App with offline capabilities

Our goal is to create an accessible, performant, and beautiful Quran listening experience for Thai-speaking Muslims.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/ninearif/quran-th.git
cd quran-th

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

## 🛠️ Development Environment Setup

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 8 or higher
- **Git**: For version control

### Installation

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/quran-th.git
   cd quran-th
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Generate Nuxt configuration
   npm run postinstall

   # Generate TypeScript types (optional)
   npm run cf-typegen
   ```

4. **Development Commands**
   ```bash
   npm run dev          # Start development server
   npm run build        # Build for production
   npm run preview      # Preview production build
   npm run lint         # Run ESLint
   npm run typecheck    # Run TypeScript checking
   ```

### Local R2 Development

This project uses **Cloudflare R2** for audio storage in both development and production environments. For local development, we use **Wrangler** (Cloudflare's CLI tool) with **Miniflare**, which provides automatic R2 bucket emulation.

#### Why Unified R2?

Previously, the application used different storage approaches for development (`/public/audio/`) and production (Cloudflare R2), requiring conditional logic and environment-specific code paths. The unified R2 approach:

- ✅ Uses the same code in development and production
- ✅ Eliminates environment-specific conditional logic
- ✅ Provides realistic local testing with R2 API
- ✅ Simplifies onboarding for contributors
- ✅ Ensures development matches production behavior

#### How It Works

**Wrangler + Miniflare** provides local R2 emulation:
- Wrangler is Cloudflare's official CLI tool (included in dependencies)
- Miniflare is bundled with Wrangler and provides R2 emulation
- Local R2 data is stored in `.wrangler/state/v3/r2/` directory
- The same R2 API code works identically in both environments

#### Setup Workflow

1. **Seed Local R2 Bucket**
   ```bash
   npm run seed:r2
   ```
   This uploads audio files from `seed-data/audio/` to your local R2 bucket.

2. **Start Development Server**
   ```bash
   npm run dev:cf
   ```
   This starts Wrangler's development server with R2 emulation enabled.

3. **Access Application**
   Open `http://localhost:8787` in your browser.

#### Seeding Commands

```bash
# Seed local R2 with sample audio files
npm run seed:r2

# Force overwrite existing files in local R2
npm run seed:r2:force

# Clean local R2 storage (removes all files)
npm run clean:r2

# Clean and re-seed (fresh start)
npm run clean:r2 && npm run seed:r2
```

#### Seed Data Structure

Sample audio files are stored in `seed-data/audio/` with the following structure:

```
seed-data/audio/
├── 001/              # Reciter ID (padded to 3 digits)
│   ├── 001.ogg      # Surah 1: อัล-ฟาติฮะฮ์ (Al-Fatihah)
│   ├── 112.ogg      # Surah 112: อัล-อิคลาศ (Al-Ikhlas)
│   ├── 113.ogg      # Surah 113: อัล-ฟะลัก (Al-Falaq)
│   └── 114.ogg      # Surah 114: อัน-นาส (An-Nas)
└── 002/              # Another reciter
    ├── 001.ogg
    ├── 112.ogg
    ├── 113.ogg
    └── 114.ogg
```

This structure matches the production R2 bucket exactly: `{reciterId}/{surahId}.ogg`

> **Development Audio Files**: The local development environment includes sample audio for only 4 surahs (for both reciters) to keep the repository size manageable. These surahs provide sufficient coverage for testing audio playback, seeking, reciter switching, and error handling functionality.

#### Development Workflow

**First Time Setup:**
```bash
npm install          # Install dependencies (includes Wrangler)
npm run seed:r2      # Seed local R2 bucket
npm run dev:cf       # Start development server
```

**Daily Development:**
```bash
npm run dev:cf       # Start development server
```

**Adding New Seed Files:**
```bash
# 1. Add audio files to seed-data/audio/{reciterId}/{surahId}.ogg
# 2. Re-seed local R2
npm run seed:r2
```

**Resetting Local R2:**
```bash
npm run clean:r2     # Remove all local R2 data
npm run seed:r2      # Re-seed from scratch
```

#### Troubleshooting

**Problem**: "R2 bucket binding not found" error

**Solution**: Ensure `wrangler.jsonc` has the R2 bucket configured:
```jsonc
{
  "r2_buckets": [
    {
      "binding": "AUDIO_BUCKET",
      "bucket_name": "quran-audio-bucket"
    }
  ]
}
```

---

**Problem**: Audio files not playing in development

**Solution**: 
1. Check if local R2 is seeded: `ls -la .wrangler/state/v3/r2/`
2. Re-seed if empty: `npm run seed:r2`
3. Restart dev server: `npm run dev:cf`

---

**Problem**: "Cannot find module 'wrangler'" error

**Solution**: Wrangler is included in dependencies. Run:
```bash
npm install
```

---

**Problem**: Seed script fails with "ENOENT" error

**Solution**: Ensure `seed-data/audio/` directory exists with audio files:
```bash
ls -la seed-data/audio/
```

---

**Problem**: Local R2 data persists between sessions

**Solution**: This is expected behavior. Miniflare stores data in `.wrangler/state/` for persistence. To reset:
```bash
npm run clean:r2
npm run seed:r2
```

---

**Problem**: Port 8787 already in use

**Solution**: Kill the existing process or use a different port:
```bash
# Kill existing process
lsof -ti:8787 | xargs kill -9

# Or use different port
wrangler dev --port 8788
```

#### Understanding Local R2 Storage

**Storage Location**: `.wrangler/state/v3/r2/quran-audio-bucket/`

**File Structure**:
- Miniflare stores R2 objects in a SQLite database
- Object keys match production: `001/001.ogg`, `002/001.ogg`, etc.
- Metadata (size, etag, content-type) is preserved

**Persistence**:
- Local R2 data persists between development sessions
- Stored in `.wrangler/state/` directory (gitignored)
- Clean with `npm run clean:r2` when needed

**API Compatibility**:
- Miniflare implements the full R2 API
- Supports `get()`, `head()`, `list()`, `put()`, `delete()`
- Supports Range requests for audio seeking
- Returns identical response structures to production

#### Production vs Development

| Aspect | Development (Miniflare) | Production (Cloudflare R2) |
|--------|------------------------|----------------------------|
| Storage | `.wrangler/state/v3/r2/` | Cloudflare R2 Bucket |
| API | Same R2 API | Same R2 API |
| Code | Identical | Identical |
| Performance | Local file system | Global edge network |
| Setup | `npm run seed:r2` | Upload to R2 bucket |

## 🏗️ Code Architecture Guidelines

### Component Architecture

Our application follows a **modular component architecture** with clear separation of concerns:

```
app/components/
├── headers/          # Platform-specific headers (MobileHeader, DesktopHeader)
├── layouts/          # Layout orchestration (MobileLayout, DesktopLayout)
├── player/           # Audio players (MobilePlayer, DesktopPlayer, MiniPlayer)
├── ui/              # Reusable UI (SurahCardList, ReciterList, TabNavigation)
├── modals/          # Overlay components (PlayerConfigModal, AboutModal)
└── views/           # Page views (MobilePlayerView, MobilePlaylistView)
```

### TypeScript Standards

- **Strict Mode**: All code uses TypeScript strict mode
- **Interface First**: Define interfaces before implementation
- **Component Props**: Use strongly-typed props with interfaces
- **Composables**: Business logic in typed composables (`useAudioPlayer`, `useReciters`)

### Vue 3 Composition API Patterns

```vue
<script setup lang="ts">
// ✅ Good: Use script setup with TypeScript
import type { Surah, Reciter } from '~/types/quran'

interface Props {
  surah: Surah
  reciter: Reciter
}

const props = defineProps<Props>()
const emit = defineEmits<{
  play: [surah: Surah]
}>()
</script>
```

### Responsive Design Principles

- **Mobile-First**: Design for mobile, enhance for desktop
- **Breakpoint**: Use `md:` prefix for 768px+ screens
- **Component Separation**: Different components for mobile vs desktop layouts
- **Progressive Enhancement**: Base functionality + enhanced features

### Styling Guidelines

- **Tailwind CSS**: Use utility classes for styling
- **Nuxt UI**: Leverage Nuxt UI components when available
- **Custom Fonts**: InterThaiLoopless for Thai text rendering
- **Dark Mode**: Support both light and dark themes

## 🔄 Development Workflow

### Branch Strategy

1. **Main Branch**: `main` - Production-ready code
2. **Feature Branches**: `feature/feature-name` - New features
3. **Bug Fixes**: `fix/bug-description` - Bug fixes
4. **Hotfixes**: `hotfix/critical-fix` - Critical production fixes

### Pull Request Requirement

**⚠️ All changes must go through Pull Requests** - Direct commits to `main` are not allowed.

1. **Create Feature Branch**: Always branch from `main` for any changes
2. **Open Pull Request**: All contributions require PR review and automated validation
3. **Automated Validation**: PRs must pass all checks before merge
4. **Code Review**: Maintainer approval required for all changes
5. **No Direct Commits**: Never commit directly to `main` branch

### Commit Convention

We use **Conventional Commits** with English descriptions:

```bash
# Feature (minor version bump)
feat: add search functionality to surah list

# Bug fix (patch version bump)
fix: resolve audio playback issue on Safari

# Performance (patch version bump)
perf: improve audio loading speed

# Refactor (patch version bump)
refactor: restructure audio player components

# Documentation (no version bump)
docs: update installation guide

# Style changes (no version bump)
style: format code according to ESLint rules

# Tests (no version bump)
test: add audio functionality tests

# Chores (no version bump)
chore: update dependencies

# CI/CD (no version bump)
ci: improve GitHub Actions workflow

# Build system (no version bump)
build: update Vite configuration

# Breaking changes (major version bump)
feat!: change audio player API structure

BREAKING CHANGE: rename prop from 'audioUrl' to 'src'
```

### Commit Message Rules

- **Header**: Maximum 100 characters
- **Type**: Use lowercase (feat, fix, docs, etc.)
- **Subject**: No period at the end, lower case start
- **Body**: Optional, maximum 100 characters per line
- **Breaking Changes**: Use `BREAKING CHANGE:` in footer

## 🧪 Code Quality Standards

### Automated Checks

Every pull request automatically runs:

1. **ESLint**: Code style and quality checking
2. **TypeScript**: Type checking and compilation
3. **Build Test**: Ensures code compiles successfully
4. **Commit Validation**: Conventional commit format
5. **Bundle Size**: Monitors bundle size changes

### Local Quality Checks

Before committing, run:

```bash
npm run lint          # Check code style
npm run lint:fix      # Auto-fix style issues
npm run typecheck     # Verify TypeScript
npm run build         # Test production build
```

### Testing Requirements

For contributions involving:

- **Audio Features**: Test on Chrome, Firefox, Safari
- **UI Changes**: Test mobile (< 768px) and desktop (≥ 768px)
- **Thai Text**: Verify font rendering with InterThaiLoopless
- **Progressive Web App**: Test offline functionality
- **Accessibility**: Ensure keyboard navigation works

## 🎵 Audio System Guidelines

### Howler.js Integration

When working with audio features:

```typescript
// ✅ Good: Use composable pattern
const { currentSurah, isPlaying, playAudio } = useAudioPlayer()

// ✅ Good: Handle loading states
const playingSurah = ref<number | null>(null)
const loading = ref(false)

const handlePlay = async (surah: Surah) => {
  loading.value = true
  try {
    await playAudio(surah)
  } finally {
    loading.value = false
  }
}
```

### Media Session API

Ensure audio controls work with:
- Lock screen controls
- Notification center
- Bluetooth devices
- Car systems

### Cross-Platform Testing

Test audio functionality on:
- **Mobile**: iOS Safari, Chrome Android
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Format Support**: MP3 and OGG fallbacks

## 📝 Pull Request Process

### Using the PR Template

We provide a comprehensive PR template that includes:

```markdown
## Summary
<!-- Brief description of changes -->

## Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 💥 Breaking change
- [ ] 📚 Documentation
- [ ] 🎨 Style/UI
- [ ] ♻️ Refactoring

## Testing
- [ ] 📱 Mobile tested
- [ ] 💻 Desktop tested
- [ ] 🎵 Audio functionality (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] No TypeScript/ESLint errors
- [ ] Tested on mobile and desktop
- [ ] Conventional commit messages
```

### Automated Validation

Your PR will automatically:

1. **Run Quality Checks**: Lint, typecheck, build
2. **Validate Commits**: Ensure conventional commit format
3. **Monitor Bundle Size**: Check for significant size increases
4. **Post Results**: Bot comment with validation status

### Review Process

1. **Self-Review**: Review your own code first
2. **Automated Checks**: Ensure all checks pass
3. **Code Review**: Maintainer review for quality and standards
4. **Testing**: Manual testing if needed
5. **Merge**: Automatic deployment after merge

## 🚢 Deployment & Release Process

### Automatic Releases

We use **Semantic Release** for automated version management:

- **Commit Analysis**: Determines version bump from commit messages
- **Changelog Generation**: Automatic changelog with emojis
- **GitHub Release**: Creates tagged releases
- **Deployment**: Automatic deployment to Cloudflare Workers

### Release Types

- `feat:` → Minor version (1.1.0)
- `fix:`, `perf:`, `refactor:` → Patch version (1.0.1)
- `BREAKING CHANGE:` → Major version (2.0.0)
- `docs:`, `style:`, `test:`, `chore:` → No release

### Deployment Pipeline

1. **PR Merge** → Triggers semantic-release
2. **Version Calculation** → Based on conventional commits
3. **Changelog Update** → Automatic generation
4. **GitHub Release** → Tagged release with assets
5. **Cloudflare Deploy** → Edge deployment
6. **Success Notification** → Release notes posted

## 🌐 Thai Language & Accessibility

### Thai Language Support

- **Font**: Use InterThaiLoopless font family
- **Text Rendering**: Test on different devices for proper rendering
- **Localization**: All UI text should support Thai
- **RTL Consideration**: Be mindful of text direction

### Accessibility Guidelines

- **Keyboard Navigation**: All interactive elements should be keyboard accessible
- **Screen Readers**: Use semantic HTML and ARIA labels
- **Color Contrast**: Ensure sufficient contrast in both themes
- **Focus Management**: Visible focus indicators
- **Audio Controls**: Standard media control patterns

### Font Integration

```vue
<template>
  <!-- ✅ Good: Proper Thai font usage -->
  <p class="font-thai text-lg">ข้อความภาษาไทย</p>
</template>

<style>
/* Custom font classes defined in main.css */
.font-thai {
  font-family: 'InterThaiLoopless', sans-serif;
}
</style>
```

## 👥 Community Guidelines

### Code of Conduct

- **Respectful Communication**: Be kind and professional
- **Constructive Feedback**: Focus on code, not person
- **Inclusive Environment**: Welcome all skill levels
- **Cultural Sensitivity**: Respect Thai language and Islamic context

### Getting Help

- **Issues**: Open GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check existing docs first
- **Code Review**: Ask questions during review process

### Contribution Types

We welcome various types of contributions:

- **🐛 Bug Fixes**: Fix existing issues
- **✨ New Features**: Add requested functionality
- **📚 Documentation**: Improve guides and docs
- **🎨 UI/UX**: Enhance user interface
- **⚡ Performance**: Optimize speed and efficiency
- **🌐 Localization**: Improve Thai language support
- **♿ Accessibility**: Enhance accessibility features
- **🧪 Testing**: Add or improve tests

### Recognition

Contributors are recognized in:
- GitHub Contributors list
- Release notes (when applicable)
- Community acknowledgments

## 📊 Development Metrics

### Bundle Size Monitoring

We monitor bundle size to ensure performance:
- **Warning**: > 10% increase from base
- **Error**: > 25% increase from base
- **Target**: Keep initial bundle < 200KB

### Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

## 🔧 Advanced Development

### Cloudflare Workers Considerations

When developing for edge deployment:

```typescript
// ✅ Good: Environment-aware code
const isDev = process.env.NODE_ENV === 'development'
const audioBaseUrl = isDev
  ? '/audio'
  : 'https://cdn.example.com/audio'
```

### PWA Features

When working with PWA functionality:
- **Service Worker**: Manual cache management
- **Manifest**: App configuration
- **Offline**: Audio caching strategy
- **Updates**: Version-based cache invalidation

### Component Testing

Test components in isolation:

```vue
<!-- Test responsive behavior -->
<div class="md:hidden">Mobile Component</div>
<div class="hidden md:block">Desktop Component</div>
```

## 📞 Contact

- **Project Maintainer**: [@ninearif](https://github.com/ninearif)
- **Issues**: [GitHub Issues](https://github.com/quran-th/quran.in.th/issues)

---

Thank you for contributing to Quran-TH! Your contributions help make this application better for the Thai Muslim community. 🙏

ขอบคุณสำหรับการมีส่วนร่วมในโปรเจค Quran-TH! การมีส่วนร่วมของคุณช่วยให้แอปพลิเคชันนี้ดีขึ้นสำหรับชุมชนมุสลิมไทย 🙏
