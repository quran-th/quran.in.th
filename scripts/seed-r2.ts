#!/usr/bin/env node

import { readdir, readFile, stat } from 'fs/promises'
import { join, relative, dirname  } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface SeedOptions {
  dryRun?: boolean
  verbose?: boolean
}

interface SeedResult {
  uploaded: number
  failed: number
  errors: string[]
}

interface FileToUpload {
  localPath: string
  objectKey: string
  size: number
}

/**
 * Recursively find all .ogg files in the seed data directory
 */
async function findAudioFiles(baseDir: string): Promise<FileToUpload[]> {
  const files: FileToUpload[] = []

  async function scanDirectory(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        await scanDirectory(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.ogg')) {
        const stats = await stat(fullPath)
        const relativePath = relative(baseDir, fullPath)
        // Convert path separators to forward slashes for R2 object keys
        const objectKey = relativePath.replace(/\\/g, '/')

        files.push({
          localPath: fullPath,
          objectKey,
          size: stats.size
        })
      }
    }
  }

  await scanDirectory(baseDir)
  return files
}

/**
 * Upload a file to R2 using Wrangler's R2 API
 */
async function uploadToR2(
  file: FileToUpload,
  options: SeedOptions
): Promise<'uploaded' | 'failed'> {
  try {
    if (options.verbose) {
      console.log(`  Processing: ${file.objectKey}`)
    }

    if (options.verbose) {
      console.log(`  Reading file: ${file.localPath}`)
    }

    // Verify file can be read
    await readFile(file.localPath)

    if (options.dryRun) {
      console.log(`  [DRY RUN] Would upload: ${file.objectKey} (${formatBytes(file.size)})`)
      return 'uploaded'
    }

    // Upload using wrangler CLI
    const { execSync } = await import('child_process')

    const bucketName = 'quran-audio-bucket'
    const command = `npx wrangler r2 object put ${bucketName}/${file.objectKey} --file="${file.localPath}" --local`

    if (options.verbose) {
      console.log(`  Executing: ${command}`)
    }

    execSync(command, { stdio: options.verbose ? 'inherit' : 'pipe' })

    console.log(`  ✓ Uploaded: ${file.objectKey} (${formatBytes(file.size)})`)
    return 'uploaded'
  } catch (error) {
    console.error(`  ✗ Failed: ${file.objectKey}`)
    if (options.verbose && error instanceof Error) {
      console.error(`    Error: ${error.message}`)
    }
    return 'failed'
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Main seeding function
 */
async function seedR2Bucket(options: SeedOptions): Promise<SeedResult> {
  const result: SeedResult = {
    uploaded: 0,
    failed: 0,
    errors: []
  }

  console.log('🌱 Starting R2 bucket seeding...\n')

  // Determine seed data directory
  const seedDataDir = join(__dirname, '..', 'seed-data', 'audio')

  if (options.verbose) {
    console.log(`Seed data directory: ${seedDataDir}`)
    console.log(`Options:`, options)
    console.log()
  }

  // Find all audio files
  console.log('📂 Scanning for audio files...')
  const files = await findAudioFiles(seedDataDir)
  console.log(`Found ${files.length} audio file(s)\n`)

  if (files.length === 0) {
    console.log('⚠️  No audio files found in seed-data/audio/')
    return result
  }

  // Upload each file
  console.log('📤 Uploading files to R2...\n')

  for (const file of files) {
    const uploadResult = await uploadToR2(file, options)

    if (uploadResult === 'uploaded') {
      result.uploaded++
    } else {
      result.failed++
      result.errors.push(`Failed to upload ${file.objectKey}`)
    }
  }

  return result
}

/**
 * Parse command line arguments
 */
function parseArgs(): SeedOptions {
  const args = process.argv.slice(2)

  return {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    verbose: args.includes('--verbose') || args.includes('-v')
  }
}

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
Usage: npm run seed:r2 [options]

Options:
  --dry-run, -d      Preview what would be uploaded without actually uploading
  --verbose, -v      Show detailed logging
  --help, -h         Show this help message

Examples:
  npm run seed:r2                    # Upload all files
  npm run seed:r2 -- --dry-run       # Preview without uploading
  npm run seed:r2 -- --verbose       # Show detailed logs
  npm run clean:r2 && npm run seed:r2  # Clean bucket and re-seed
`)
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    printUsage()
    process.exit(0)
  }

  const options = parseArgs()

  try {
    const result = await seedR2Bucket(options)

    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 Seeding Summary')
    console.log('='.repeat(50))
    console.log(`✓ Uploaded: ${result.uploaded}`)
    console.log(`✗ Failed:   ${result.failed}`)

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:')
      result.errors.forEach(error => console.log(`  - ${error}`))
    }

    console.log()

    if (result.failed > 0) {
      console.log('⚠️  Some files failed to upload. Check the errors above.')
      process.exit(1)
    } else if (result.uploaded === 0) {
      console.log('ℹ️  No files were processed.')
    } else {
      console.log('✅ Seeding completed successfully!')
    }
  } catch (error) {
    console.error('\n❌ Fatal error during seeding:')
    console.error(error)
    process.exit(1)
  }
}

// Run the script
main()
