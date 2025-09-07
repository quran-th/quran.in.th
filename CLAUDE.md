# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt.js 4 application named "quran-th" configured for deployment to Cloudflare Workers. The project uses Vue 3 with TypeScript, Nuxt UI for components, and is set up for edge runtime deployment.

## Development Commands

**Development server:**
```bash
npm run dev
```
Starts the development server on `http://localhost:3000`

**Build for production:**
```bash
npm run build
```
Builds the application for production deployment

**Generate static site:**
```bash
npm run generate
```
Generates a static version of the site

**Preview production build:**
```bash
npm run preview
```
Builds and previews the production build using Wrangler

**Deploy to Cloudflare:**
```bash
npm run deploy
```
Builds and deploys to Cloudflare Workers

**Generate Cloudflare types:**
```bash
npm run cf-typegen
```
Generates TypeScript types for Cloudflare Workers

## Architecture

- **Framework:** Nuxt 4 with Vue 3
- **UI Components:** Nuxt UI (@nuxt/ui) - Tailwind CSS-based component library
- **Code Quality:** ESLint with Nuxt configuration (@nuxt/eslint)
- **Runtime:** Cloudflare Workers (edge runtime)
- **TypeScript:** Configured with project references to .nuxt generated configs
- **Deployment:** Cloudflare Workers via Wrangler

### Key Configuration Files

- `nuxt.config.ts`: Main Nuxt configuration with Cloudflare preset
- `wrangler.jsonc`: Cloudflare Workers deployment configuration
- `tsconfig.json`: TypeScript configuration with Nuxt-generated references
- `worker-configuration.d.ts`: Cloudflare Workers type definitions

### Directory Structure

- `app/`: Main application code (currently contains minimal app.vue)
- `public/`: Static assets (favicon, robots.txt)
- `.output/`: Build output directory (auto-generated)
- `.nuxt/`: Nuxt build cache and generated files

### Deployment Configuration

The app is configured for Cloudflare Workers deployment with:
- Smart Placement capability (commented out)
- Assets binding for static files
- Observability enabled
- Node.js compatibility enabled

### Notes

- Project uses `nitro-cloudflare-dev` module for local Cloudflare Workers development
- Nuxt UI provides ready-to-use Tailwind CSS components with accessibility built-in
- ESLint configured for code quality and consistency
- Uses UApp component wrapper for Nuxt UI functionality
- Currently a minimal setup ready for component development