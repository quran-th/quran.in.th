# Audio CDN Setup for Quran Player

## Current Setup

### Local Development
- Audio files are stored in `public/audio/` directory
- Files are named by Surah ID with 3-digit padding: `001.mp3`, `002.mp3`, ..., `114.mp3`
- Total size: ~2.7GB (114 audio files)
- Files are served statically via Nuxt's public directory

### Production (Cloudflare Workers)
- Audio files will be deployed as static assets via Cloudflare Workers
- Cloudflare's global CDN will automatically cache and distribute the files
- Assets binding is configured in `wrangler.jsonc`

### File Structure
```
public/audio/
├── 001.mp3  (Al-Fatiha)
├── 002.mp3  (Al-Baqarah)
├── ...
└── 114.mp3  (An-Nas)
```

### Configuration
- **wrangler.jsonc**: Assets binding configured for CDN
- **.gitignore**: Audio files excluded from git (too large)
- **audioService.ts**: Updated to use local audio files
- **audioMeta.json**: Metadata about audio configuration

## CDN Benefits

1. **Global Distribution**: Files served from nearest Cloudflare edge
2. **Automatic Caching**: Cloudflare handles HTTP caching headers
3. **High Performance**: Fast loading times worldwide
4. **Bandwidth Optimization**: Efficient delivery of large audio files
5. **No External Dependencies**: Self-hosted audio files

## Next Steps for Production

1. Deploy to Cloudflare Workers: `npm run deploy`
2. Verify audio files are accessible via CDN
3. Update domain in wrangler.jsonc if using custom domain
4. Monitor performance and caching effectiveness

## Usage in Application

Audio files are accessed via: `/audio/{surah_id_padded}.mp3`
- Development: `http://localhost:3000/audio/001.mp3`
- Production: `https://your-domain.workers.dev/audio/001.mp3`