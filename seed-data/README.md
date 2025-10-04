# Seed Data for Local R2 Development

This directory contains sample audio files used to seed the local R2 bucket during development.

## Structure

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

**Development Audio Files**: Only 4 surahs are included in the seed data to keep the repository size manageable while providing sufficient coverage for testing:
- Surah 1 (Al-Fatihah) - The opening chapter
- Surah 112 (Al-Ikhlas) - Short surah for quick testing
- Surah 113 (Al-Falaq) - Short surah for quick testing
- Surah 114 (An-Nas) - Short surah for quick testing

Example paths:
- `001/001.ogg` → Reciter 1, Surah 1
- `002/112.ogg` → Reciter 2, Surah 112
- `001/114.ogg` → Reciter 1, Surah 114

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
