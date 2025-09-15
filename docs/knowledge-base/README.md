# Quran-TH Knowledge Base

📚 **Comprehensive project documentation and knowledge base for the Quran-TH application**

## Overview

Quran-TH is a modern, responsive Quran audio player application with Thai language support, built on Nuxt 4 and deployed to Cloudflare Workers. This knowledge base provides detailed documentation of the project's architecture, components, and development workflows.

## Quick Navigation

### 🏗️ Architecture & Design
- [Project Architecture](./architecture.md) - System design and component relationships
- [Data Structures](./data-structures.md) - TypeScript interfaces and data models
- [Audio System](./audio-system.md) - Audio playback architecture and streaming

### 🎨 Frontend Components
- [UI Components](./components.md) - Vue components and their responsibilities
- [Composables](./composables.md) - Reusable Vue composition functions
- [Responsive Design](./responsive-design.md) - Mobile and desktop layouts

### ⚡ Technical Implementation
- [Configuration](./configuration.md) - Nuxt config, TypeScript setup, and build process
- [Deployment](./deployment.md) - Cloudflare Workers deployment and CI/CD
- [Performance](./performance.md) - Optimization strategies and best practices

### 📊 Development Workflow
- [Development Guide](./development.md) - Local setup and development workflow
- [Code Standards](./standards.md) - Coding conventions and quality guidelines
- [Testing Strategy](./testing.md) - Testing approach and implementation

### 🔧 Maintenance & Operations
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
- [API Reference](./api-reference.md) - Internal APIs and external integrations
- [Environment Setup](./environment.md) - Environment variables and configuration

## Project Structure Map

```
quran-th/
├── app/                    # Main application code
│   ├── components/         # Vue components
│   ├── composables/        # Composition functions
│   ├── data/              # Static data and metadata
│   ├── pages/             # Page components
│   ├── types/             # TypeScript definitions
│   └── assets/            # Stylesheets and assets
├── public/                 # Static files
│   ├── audio/             # Sample audio files
│   ├── fonts/             # Thai font files
│   └── media assets       # Images and PWA manifest
├── docs/                   # Documentation (this knowledge base)
└── config files           # Nuxt, TypeScript, and deployment config
```

## Key Features

- **🎵 Advanced Audio Player**: Howler.js integration with streaming optimization
- **📱 Responsive Design**: Mobile circular player + desktop table layout
- **🌐 Thai Language Support**: Full localization with custom fonts
- **⚡ Edge Deployment**: Optimized for Cloudflare Workers
- **🎨 Modern UI**: Nuxt UI components with Tailwind CSS
- **🔊 Media Session API**: Native audio controls and background playback
- **📴 Progressive Web App**: Offline-first with service worker

## Getting Started

1. **[Development Setup](./development.md)** - Set up local development environment
2. **[Architecture Overview](./architecture.md)** - Understand system design
3. **[Component Guide](./components.md)** - Learn about UI components
4. **[Audio System](./audio-system.md)** - Understand audio playback architecture

## Contribution Guidelines

When working on this project:

1. Follow the [Code Standards](./standards.md)
2. Update relevant documentation in this knowledge base
3. Test changes across mobile and desktop layouts
4. Ensure Thai language support remains intact
5. Validate Cloudflare Workers compatibility

## Support & Resources

- **Framework**: [Nuxt 4 Documentation](https://nuxt.com/docs)
- **UI Library**: [Nuxt UI Documentation](https://ui.nuxt.com/)
- **Deployment**: [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- **Audio**: [Howler.js Documentation](https://howlerjs.com/)

---

📝 **Last Updated**: ${new Date().toISOString().split('T')[0]}
🔄 **Version**: Based on current project state