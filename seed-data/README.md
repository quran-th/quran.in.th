# Seed Data for Local R2 Development

This directory contains sample audio files used to seed the local R2 bucket during development.

## Structure

```
seed-data/audio/
├── {reciterId}/
│   └── {surahId}.ogg
```

Example:
- `001/001.ogg` → Reciter 1, Surah 1
- `002/001.ogg` → Reciter 2, Surah 1
- `002/002.ogg` → Reciter 2, Surah 2

## Usage

To seed your local R2 bucket with these files:

```bash
npm run seed:r2
```

This will upload all files from `seed-data/audio/` to your local R2 bucket using the Wrangler R2 API.

## Adding New Files

1. Place audio files in the appropriate directory: `seed-data/audio/{reciterId}/{surahId}.ogg`
2. Run `npm run seed:r2` to upload to local R2
3. Commit the new files to the repository

## Notes

- Only `.ogg` format files are used (matching production)
- File naming must use zero-padded 3-digit format (e.g., `001.ogg`, not `1.ogg`)
- Directory structure must match production R2 bucket structure
