export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { reciterId, chapterId } = query
  
  if (!reciterId || !chapterId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing reciterId or chapterId parameters'
    })
  }

  try {
    // Fetch from Quran.com API with proper headers
    const response = await $fetch(`https://quran.com/api/proxy/content/api/qdc/audio/reciters/${reciterId}/audio_files`, {
      query: {
        chapter: chapterId,
        segments: 'true'
      },
      headers: {
        'User-Agent': 'QuranPlayer/1.0',
        'Accept': 'application/json',
        'Referer': 'https://quran.com/',
        'Origin': 'https://quran.com'
      }
    })
    
    return response
  } catch (error) {
    console.error('Error fetching audio data:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch audio data from Quran.com API'
    })
  }
})