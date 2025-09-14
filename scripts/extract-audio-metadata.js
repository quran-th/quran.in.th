#!/usr/bin/env node

/**
 * Audio Metadata Extraction Script
 * 
 * This script extracts metadata from audio files and can be used for:
 * 1. Getting audio duration, file size, format
 * 2. Renaming files to a consistent format
 * 3. Generating metadata JSON for the application
 * 
 * Usage:
 *   node scripts/extract-audio-metadata.js [options]
 * 
 * Options:
 *   --extract-only    Only extract metadata, don't rename files
 *   --rename-only     Only rename files, don't extract metadata
 *   --output <file>   Output metadata to specific JSON file
 *   --format <format> Naming format: 'simple' (1.mp3) or 'padded' (001.mp3)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const AUDIO_DIR = path.join(__dirname, '../public/audio');
const OUTPUT_DIR = path.join(__dirname, '../app/data');
const SURAH_DATA_FILE = path.join(__dirname, '../app/surah.txt');

// Surah data with English names (from useSurahs.ts)
const ENGLISH_NAMES = {
  1: 'Al-Fatiha', 2: 'Al-Baqarah', 3: 'Ali Imran', 4: 'An-Nisa', 5: 'Al-Maidah',
  6: 'Al-Anam', 7: 'Al-Araf', 8: 'Al-Anfal', 9: 'At-Tawbah', 10: 'Yunus',
  11: 'Hud', 12: 'Yusuf', 13: 'Ar-Rad', 14: 'Ibrahim', 15: 'Al-Hijr',
  16: 'An-Nahl', 17: 'Al-Isra', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Taha',
  21: 'Al-Anbiya', 22: 'Al-Hajj', 23: 'Al-Muminun', 24: 'An-Nur', 25: 'Al-Furqan',
  26: 'Ash-Shuara', 27: 'An-Naml', 28: 'Al-Qasas', 29: 'Al-Ankabut', 30: 'Ar-Rum',
  31: 'Luqman', 32: 'As-Sajdah', 33: 'Al-Ahzab', 34: 'Saba', 35: 'Fatir',
  36: 'Ya-Sin', 37: 'As-Saffat', 38: 'Sad', 39: 'Az-Zumar', 40: 'Ghafir',
  41: 'Fussilat', 42: 'Ash-Shura', 43: 'Az-Zukhruf', 44: 'Ad-Dukhan', 45: 'Al-Jathiyah',
  46: 'Al-Ahqaf', 47: 'Muhammad', 48: 'Al-Fath', 49: 'Al-Hujurat', 50: 'Qaf',
  51: 'Adh-Dhariyat', 52: 'At-Tur', 53: 'An-Najm', 54: 'Al-Qamar', 55: 'Ar-Rahman',
  56: 'Al-Waqiah', 57: 'Al-Hadid', 58: 'Al-Mujadila', 59: 'Al-Hashr', 60: 'Al-Mumtahanah',
  61: 'As-Saff', 62: 'Al-Jumuah', 63: 'Al-Munafiqun', 64: 'At-Taghabun', 65: 'At-Talaq',
  66: 'At-Tahrim', 67: 'Al-Mulk', 68: 'Al-Qalam', 69: 'Al-Haqqah', 70: 'Al-Maarij',
  71: 'Nuh', 72: 'Al-Jinn', 73: 'Al-Muzzammil', 74: 'Al-Muddaththir', 75: 'Al-Qiyamah',
  76: 'Al-Insan', 77: 'Al-Mursalat', 78: 'An-Naba', 79: 'An-Naziat', 80: 'Abasa',
  81: 'At-Takwir', 82: 'Al-Infitar', 83: 'Al-Mutaffifin', 84: 'Al-Inshiqaq', 85: 'Al-Buruj',
  86: 'At-Tariq', 87: 'Al-Ala', 88: 'Al-Ghashiyah', 89: 'Al-Fajr', 90: 'Al-Balad',
  91: 'Ash-Shams', 92: 'Al-Layl', 93: 'Ad-Duha', 94: 'Ash-Sharh', 95: 'At-Tin',
  96: 'Al-Alaq', 97: 'Al-Qadr', 98: 'Al-Bayyinah', 99: 'Az-Zalzalah', 100: 'Al-Adiyat',
  101: 'Al-Qariah', 102: 'At-Takathur', 103: 'Al-Asr', 104: 'Al-Humazah', 105: 'Al-Fil',
  106: 'Quraysh', 107: 'Al-Maun', 108: 'Al-Kawthar', 109: 'Al-Kafirun', 110: 'An-Nasr',
  111: 'Al-Masad', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas'
};

// Verse counts for each surah
const VERSE_COUNTS = {
  1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
  11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
  21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
  31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
  41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
  51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
  61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
  81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
  91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
  101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
  111: 5, 112: 4, 113: 5, 114: 6
};

/**
 * Check if ffprobe is available
 */
function checkFFProbe() {
  try {
    execSync('ffprobe -version', { stdio: 'ignore' });
    return true;
  } catch {
    console.log('⚠️  FFProbe not found. Installing ffmpeg...');
    try {
      // Try to install ffmpeg via homebrew on macOS
      execSync('brew install ffmpeg', { stdio: 'inherit' });
      return true;
    } catch {
      console.error('❌ Could not install ffmpeg. Please install manually:');
      console.error('   macOS: brew install ffmpeg');
      console.error('   Ubuntu: sudo apt install ffmpeg');
      console.error('   Windows: Download from https://ffmpeg.org/');
      return false;
    }
  }
}

/**
 * Extract audio metadata using ffprobe
 */
function getAudioMetadata(filePath) {
  try {
    const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
    const output = execSync(command, { encoding: 'utf8' });
    const data = JSON.parse(output);
    
    const audioStream = data.streams.find(stream => stream.codec_type === 'audio');
    const format = data.format;
    
    return {
      duration: parseFloat(format.duration) || 0,
      size: parseInt(format.size) || 0,
      bitRate: parseInt(format.bit_rate) || 0,
      format: format.format_name || 'unknown',
      codec: audioStream?.codec_name || 'unknown'
    };
  } catch (error) {
    console.error(`Error extracting metadata from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Load Thai names from surah.txt
 */
function loadThaiNames() {
  try {
    if (!fs.existsSync(SURAH_DATA_FILE)) {
      console.warn('⚠️  surah.txt not found, using English names only');
      return {};
    }
    
    const content = fs.readFileSync(SURAH_DATA_FILE, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    const thaiNames = {};
    
    lines.forEach(line => {
      const match = line.match(/^(\d+)-\s*(.+)$/);
      if (match) {
        const [, numberStr, name] = match;
        const id = parseInt(numberStr);
        thaiNames[id] = name.trim();
      }
    });
    
    return thaiNames;
  } catch (error) {
    console.error('Error loading Thai names:', error.message);
    return {};
  }
}

/**
 * Parse surah ID from filename
 */
function parseSurahIdFromFilename(filename) {
  // Try to extract number from the beginning of filename
  const match = filename.match(/^(\d{3})/);
  if (match) {
    return parseInt(match[1]);
  }
  
  // If no 3-digit number at start, look for any number pattern
  const fallbackMatch = filename.match(/(\d+)/);
  if (fallbackMatch) {
    const num = parseInt(fallbackMatch[1]);
    if (num >= 1 && num <= 114) {
      return num;
    }
  }
  
  return null;
}

/**
 * Get new filename based on format
 */
function getNewFilename(surahId, format = 'padded') {
  if (format === 'simple') {
    return `${surahId}.mp3`;
  } else {
    return `${surahId.toString().padStart(3, '0')}.mp3`;
  }
}

/**
 * Process all audio files
 */
async function processAudioFiles(options = {}) {
  const { extractOnly = false, renameOnly = false, format = 'padded', output = 'audioMetadata.json' } = options;
  
  if (!checkFFProbe() && !renameOnly) {
    console.error('❌ FFProbe is required for metadata extraction');
    process.exit(1);
  }
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Load Thai names
  const thaiNames = loadThaiNames();
  
  // Get all audio files
  const audioFiles = fs.readdirSync(AUDIO_DIR)
    .filter(file => file.toLowerCase().endsWith('.mp3'))
    .filter(file => !file.startsWith('.'));
  
  console.log(`📁 Found ${audioFiles.length} audio files`);
  
  const metadata = {};
  const processLog = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (const filename of audioFiles) {
    const filePath = path.join(AUDIO_DIR, filename);
    const surahId = parseSurahIdFromFilename(filename);
    
    if (!surahId || surahId < 0 || surahId > 114) {
      console.warn(`⚠️  Skipping ${filename} - could not determine surah ID`);
      errorCount++;
      continue;
    }
    
    // Skip 000.mp3 (special case)
    if (surahId === 0) {
      console.log(`ℹ️  Skipping ${filename} - special file (000.mp3)`);
      continue;
    }
    
    console.log(`🔄 Processing Surah ${surahId}: ${filename}`);
    
    let audioMeta = null;
    
    // Extract metadata if not renameOnly
    if (!renameOnly) {
      audioMeta = getAudioMetadata(filePath);
      if (!audioMeta) {
        errorCount++;
        continue;
      }
    }
    
    // Prepare metadata object
    const surahMeta = {
      surah_id: surahId,
      name_th: thaiNames[surahId] || `Surah ${surahId}`,
      name_en: ENGLISH_NAMES[surahId] || `Surah ${surahId}`,
      verses_count: VERSE_COUNTS[surahId] || 0,
      original_filename: filename,
      new_filename: getNewFilename(surahId, format),
      ...(audioMeta && {
        duration: Math.round(audioMeta.duration * 100) / 100, // Round to 2 decimal places
        file_size: audioMeta.size,
        bit_rate: audioMeta.bitRate,
        format: audioMeta.format,
        codec: audioMeta.codec
      })
    };
    
    metadata[surahId] = surahMeta;
    
    // Rename file if not extractOnly
    if (!extractOnly) {
      const newFilePath = path.join(AUDIO_DIR, surahMeta.new_filename);
      if (filePath !== newFilePath) {
        try {
          fs.renameSync(filePath, newFilePath);
          processLog.push(`✅ Renamed: ${filename} → ${surahMeta.new_filename}`);
        } catch (error) {
          console.error(`❌ Error renaming ${filename}:`, error.message);
          errorCount++;
          continue;
        }
      }
    }
    
    successCount++;
  }
  
  // Save metadata JSON
  if (!renameOnly) {
    const outputPath = path.join(OUTPUT_DIR, output);
    const sortedMetadata = {};
    
    // Sort by surah ID
    Object.keys(metadata)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach(surahId => {
        sortedMetadata[surahId] = metadata[surahId];
      });
    
    fs.writeFileSync(outputPath, JSON.stringify(sortedMetadata, null, 2));
    console.log(`📄 Metadata saved to: ${outputPath}`);
  }
  
  // Print summary
  console.log('\n📊 Process Summary:');
  console.log(`✅ Successfully processed: ${successCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  
  if (processLog.length > 0) {
    console.log('\n📋 Rename Log:');
    processLog.forEach(log => console.log(log));
  }
  
  return { successCount, errorCount, metadata };
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--extract-only':
        options.extractOnly = true;
        break;
      case '--rename-only':
        options.renameOnly = true;
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--format':
        options.format = args[++i];
        break;
      case '--help':
        console.log(`
Audio Metadata Extraction Script

Usage: node scripts/extract-audio-metadata.js [options]

Options:
  --extract-only    Only extract metadata, don't rename files
  --rename-only     Only rename files, don't extract metadata  
  --output <file>   Output metadata to specific JSON file (default: audioMetadata.json)
  --format <format> Naming format: 'simple' (1.mp3) or 'padded' (001.mp3) (default: padded)
  --help           Show this help message

Examples:
  node scripts/extract-audio-metadata.js
  node scripts/extract-audio-metadata.js --extract-only --output myMetadata.json
  node scripts/extract-audio-metadata.js --format simple
        `);
        process.exit(0);
        break;
    }
  }
  
  console.log('🎵 Starting audio metadata extraction...\n');
  
  processAudioFiles(options)
    .then(() => {
      console.log('\n🎉 Process completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Process failed:', error.message);
      process.exit(1);
    });
}

export { processAudioFiles, getAudioMetadata, loadThaiNames };