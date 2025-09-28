// Import JSON data directly
import surah001 from '~/data/surah/001.json'
import surah002 from '~/data/surah/002.json'
import type { SurahApiData } from '~/types/quran'

// Map reciter IDs to their data
const surahDataMap: Record<string, SurahApiData[]> = {
  '001': surah001,
  '002': surah002
}

export default defineEventHandler(async (event) => {
  try {
    const reciterId = getRouterParam(event, 'reciterId')

    if (!reciterId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Reciter ID is required'
      })
    }

    // Pad reciter ID to 3 digits (001, 002, etc.)
    const paddedReciterId = reciterId.padStart(3, '0')

    let surahsData: SurahApiData[] = []

    // Check if we have reciter-specific data
    if (surahDataMap[paddedReciterId]) {
      surahsData = surahDataMap[paddedReciterId]
    } else {
      // Return error for unsupported reciter instead of fallback
      throw createError({
        statusCode: 404,
        statusMessage: `Reciter ${reciterId} not found.`
      })
    }

    if (surahsData.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `No surahs found for reciter ${reciterId}`
      })
    }

    return {
      reciterId: paddedReciterId,
      surahs: surahsData,
      total: surahsData.length
    }

  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load surahs data',
      data: error && typeof error === 'object' && 'message' in error
        ? (error as Error).message
        : 'Unknown error occurred'
    })
  }
})

