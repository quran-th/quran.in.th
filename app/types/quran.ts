export interface Reciter {
  id: number
  reciter_id: number
  name: string
  translatedName: string
  style: string
  styleDescription: string
  qirat: string
}

export interface Surah {
  id: number
  name: string
  thaiName: string
  arabicName: string
  englishName: string
  revelationType: 'Meccan' | 'Medinan'
  versesCount: number
  order: number
}

export interface AudioFile {
  id: number
  chapter_id: number
  file_size: number
  format: string
  audio_url: string
  duration: number
  verse_timings: VerseTiming[]
}

export interface VerseTiming {
  verse_key: string
  timestamp_from: number
  timestamp_to: number
  duration: number
  segments: number[][]
}

export interface AudioResponse {
  audio_files: AudioFile[]
}

export interface AudioPlayerState {
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  currentSurah: number | null
  currentReciter: number | null
  currentVerse: number
  audioElement: HTMLAudioElement | null
  audioFile: AudioFile | null
  error: string | null
}

export interface CachedAudio {
  surahId: number
  reciterId: number
  audioUrl: string
  audioData: Blob
  metadata: AudioFile
  cachedAt: number
  lastAccessedAt: number
  fileSize: number
}