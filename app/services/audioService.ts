import type { AudioFile, CachedAudio } from '~/types/quran'

export class AudioService {
  private dbName = 'QuranAudioCache'
  private dbVersion = 1
  private storeName = 'audioFiles'
  private db: IDBDatabase | null = null
  private maxCacheSize = 500 * 1024 * 1024 // 500MB max cache
  private maxCachedFiles = 10 // Maximum number of cached audio files

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
      // Return local audio file metadata with 3-digit padding
      const paddedId = chapterId.toString().padStart(3, '0')
      const audioUrl = `/audio/${paddedId}.mp3`
      
      // Create mock metadata that matches the expected AudioFile interface
      const audioFile: AudioFile = {
        id: chapterId,
        chapter_id: chapterId,
        file_size: 0, // Will be determined when loading
        format: 'mp3',
        audio_url: audioUrl,
        duration: 0, // Set to 0 or fetch actual duration if available
        verse_timings: [] // No verse timings for local files initially
      }
      
      return audioFile
    } catch (error) {
      console.error('Error fetching local audio metadata:', error)
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

  async getAudioUrl(surahId: number, _reciterId: number): Promise<string> {
    // For local files, return direct URL to static audio file with 3-digit padding
    const paddedId = surahId.toString().padStart(3, '0')
    const localUrl = `/audio/${paddedId}.mp3`
    
    // Check if local file exists (optional validation)
    if (import.meta.client) {
      try {
        const response = await fetch(localUrl, { method: 'HEAD' })
        if (!response.ok) {
          console.warn(`Audio file not found: ${localUrl} (this is expected in development)`)
        }
      } catch (error) {
        console.warn(`Could not check audio file: ${localUrl}`)
      }
    }
    
    return localUrl
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
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
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