import type { AudioFile, CachedAudio } from '~/types/quran'

export class AudioService {
  private dbName = 'QuranAudioCache'
  private dbVersion = 1
  private storeName = 'audioFiles'
  private db: IDBDatabase | null = null
  private maxCacheSize = 500 * 1024 * 1024 // 500MB max cache
  private maxCachedFiles = 10 // Maximum number of cached audio files
  
  // Howler.js streaming optimization settings
  private streamingConfig = {
    preloadBuffer: 'metadata' as const, // Only preload metadata for faster startup
    retryAttempts: 3,
    retryDelay: 1000, // 1 second base delay
    chunkSize: 1024 * 1024, // 1MB chunks for progressive loading
  }

  constructor() {
    this.initDB()
  }

  private async initDB(): Promise<void> {
    // if not running in client, skip
    if (!import.meta.client) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('lastAccessedAt', 'lastAccessedAt', { unique: false })
          store.createIndex('surahReciter', ['surahId', 'reciterId'], { unique: true })
        }
      }
    })
  }

  async fetchAudioMetadata(reciterId: number, chapterId: number): Promise<AudioFile> {
    try {
      // Get audio configuration from Cloudflare environment variables
      const { useLocalAudio } = await $fetch<{ useLocalAudio: boolean }>('/api/config/audio')
      const paddedSurahId = chapterId.toString().padStart(3, '0')
      const paddedReciterId = reciterId.toString().padStart(3, '0')
      
      // Environment-aware URL generation
      const audioUrl = useLocalAudio 
        ? `/audio/${paddedReciterId}/${paddedSurahId}.ogg`  // Direct access to /public/audio/ files with new structure
        : `/api/audio/${paddedReciterId}/${chapterId}` // API endpoint for R2 streaming with reciter
      
      // Create metadata that matches the expected AudioFile interface
      const audioFile: AudioFile = {
        id: chapterId,
        chapter_id: chapterId,
        file_size: 0, // Will be determined when loading
        format: 'ogg', // Updated format to ogg
        audio_url: audioUrl,
        duration: 0, // Set to 0 or fetch actual duration if available
        verse_timings: [] // No verse timings for local files initially
      }
      
      return audioFile
    } catch (error) {
      console.error('Error fetching audio metadata:', error)
      throw error
    }
  }

  async getCachedAudio(surahId: number, reciterId: number): Promise<CachedAudio | null> {
    if (!this.db || !import.meta.client) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('surahReciter')
      const request = index.get([surahId, reciterId])
      
      request.onsuccess = () => {
        if (request.result) {
          // Update last accessed time
          this.updateLastAccessed(request.result.id)
          resolve(request.result)
        } else {
          resolve(null)
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  async cacheAudio(surahId: number, reciterId: number, audioFile: AudioFile): Promise<void> {
    if (!this.db || !import.meta.client) return

    try {
      // Check if we need to clean up cache first
      await this.cleanupCache()
      
      // Fetch the audio data
      const response = await fetch(audioFile.audio_url)
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`)
      }
      
      const audioData = await response.blob()
      
      const cachedAudio: CachedAudio = {
        id: `${surahId}_${reciterId}`,
        surahId,
        reciterId,
        audioUrl: audioFile.audio_url,
        audioData,
        metadata: audioFile,
        cachedAt: Date.now(),
        lastAccessedAt: Date.now(),
        fileSize: audioData.size
      }
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.put(cachedAudio)
        
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Error caching audio:', error)
      throw error
    }
  }

  async getAudioUrl(surahId: number, reciterId: number): Promise<string> {
    // Get audio configuration from Cloudflare environment variables
    const { useLocalAudio } = await $fetch<{ useLocalAudio: boolean }>('/api/config/audio')
    const paddedSurahId = surahId.toString().padStart(3, '0')
    const paddedReciterId = reciterId.toString().padStart(3, '0')
    
    console.log('LOCAL AUDIO (from Cloudflare env):', useLocalAudio)

    // Environment-aware URL generation
    if (useLocalAudio) {
      // For local development: direct access to /public/audio/ files
      // New structure: reciter_id/surah.ogg (e.g., 001/001.ogg)
      return `/audio/${paddedReciterId}/${paddedSurahId}.ogg`
    } else {
      // For production: API endpoint streams audio from R2 with proper headers
      // for progressive loading and byte-range requests
      const baseUrl = `/api/audio/${paddedReciterId}/${surahId}`
      // Add cache-busting parameter to prevent stale cached responses
      // that might cause audio skipping issues
      const timestamp = Date.now()
      return `${baseUrl}?t=${timestamp}`
    }
  }

  // Get streaming configuration for Howler.js optimization
  getStreamingConfig() {
    return { ...this.streamingConfig }
  }

  // Enhanced audio URL with retry mechanism for failed requests
  async getAudioUrlWithRetry(surahId: number, reciterId: number, attempt: number = 1): Promise<string> {
    try {
      const url = await this.getAudioUrl(surahId, reciterId)
      
      // Verify URL is accessible (optional pre-flight check)
      if (import.meta.client && attempt === 1) {
        await this.verifyAudioUrl(url)
      }
      
      return url
    } catch (error) {
      if (attempt < this.streamingConfig.retryAttempts) {
        console.warn(`Audio URL attempt ${attempt} failed, retrying...`, error)
        await new Promise(resolve => setTimeout(resolve, this.streamingConfig.retryDelay * attempt))
        return this.getAudioUrlWithRetry(surahId, reciterId, attempt + 1)
      }
      throw error
    }
  }

  // Verify audio URL accessibility (lightweight HEAD request)
  private async verifyAudioUrl(url: string): Promise<void> {
    if (!import.meta.client) return

    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      if (!response.ok) {
        throw new Error(`Audio URL not accessible: ${response.status}`)
      }
    } catch (error) {
      console.warn('Audio URL verification failed:', error)
      // Don't throw - let Howler.js handle the actual loading
    }
  }

  private async updateLastAccessed(id: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const getRequest = store.get(id)
      
      getRequest.onsuccess = () => {
        const cachedAudio = getRequest.result
        if (cachedAudio) {
          cachedAudio.lastAccessedAt = Date.now()
          const putRequest = store.put(cachedAudio)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  private async cleanupCache(): Promise<void> {
    if (!this.db) return

    const cachedFiles = await this.getAllCachedFiles()
    
    // Check if we need to cleanup by size or count
    const totalSize = cachedFiles.reduce((sum, file) => sum + file.fileSize, 0)
    
    if (totalSize > this.maxCacheSize || cachedFiles.length > this.maxCachedFiles) {
      // Sort by last accessed time (oldest first)
      cachedFiles.sort((a, b) => a.lastAccessedAt - b.lastAccessedAt)
      
      // Remove oldest files until we're under limits
      const filesToRemove = cachedFiles.slice(0, Math.max(
        cachedFiles.length - this.maxCachedFiles,
        0
      ))
      
      for (const file of filesToRemove) {
        await this.removeCachedFile(file.id)
        
        const newTotalSize = totalSize - file.fileSize
        if (newTotalSize <= this.maxCacheSize) break
      }
    }
  }

  private async getAllCachedFiles(): Promise<CachedAudio[]> {
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  private async removeCachedFile(id: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearCache(): Promise<void> {
    // Clear IndexedDB cache
    if (this.db) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.clear()
        
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
  }

  async getCacheStats(): Promise<{ totalFiles: number; totalSize: number; lastCleanup: number }> {
    const cachedFiles = await this.getAllCachedFiles()
    const totalSize = cachedFiles.reduce((sum, file) => sum + file.fileSize, 0)
    
    return {
      totalFiles: cachedFiles.length,
      totalSize,
      lastCleanup: Date.now()
    }
  }
}

// Singleton instance
export const audioService = new AudioService()