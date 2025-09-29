/// <reference types="../../../../env.d.ts" />

export default defineEventHandler(async (event) => {
  // Enhanced CORS for Howler.js compatibility
  if (event.node.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, If-None-Match, If-Match, If-Modified-Since, If-Unmodified-Since, Content-Type',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers'
      },
    })
  }
  
  // Get parameters from the dynamic route [reciterId]/[id]
  const reciterId = getRouterParam(event, 'reciterId')
  const surahId = getRouterParam(event, 'id')
  
  // Validate parameters with enhanced error messages
  if (!reciterId || !surahId) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing reciter ID or surah ID'
    })
  }
  
  if (isNaN(Number(reciterId)) || isNaN(Number(surahId))) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Reciter ID and surah ID must be numbers'
    })
  }
  
  const reciterNumber = parseInt(reciterId)
  const surahNumber = parseInt(surahId)
  
  // Validate surah range
  if (surahNumber < 1 || surahNumber > 114) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Surah ID must be between 1 and 114' 
    })
  }
  
  // Enhanced environment detection for Cloudflare Workers
  const runtimeConfig = useRuntimeConfig()
  const { cloudflare } = event.context
  const env = cloudflare?.env
  const useLocalAudio = Boolean(runtimeConfig.useLocalAudio || env?.USE_LOCAL_AUDIO === 'true')
  
  if (useLocalAudio) {
    // Development mode: Enhanced static file serving for Howler.js compatibility
    const paddedSurahId = surahNumber.toString().padStart(3, '0')
    const paddedReciterId = reciterNumber.toString().padStart(3, '0')
    
    // Howler.js prefers format fallbacks, so we'll redirect to OGG first (smaller, better quality)
    // then let the client try MP3 if OGG fails
    const staticPath = `/audio/${paddedReciterId}/${paddedSurahId}.ogg`
    
    console.log(`[Audio API] Development mode serving: ${staticPath}`)
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': staticPath,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Type',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year in development
        'Vary': 'Accept-Encoding'
      }
    })
  }

  // Production mode: R2 streaming with proper HTTP Range request support
  const bucket = env?.AUDIO_BUCKET
  if (!bucket) {
    throw createError({ statusCode: 503, statusMessage: 'Audio service unavailable' })
  }

  const paddedSurahId = surahNumber.toString().padStart(3, '0')
  const paddedReciterId = reciterNumber.toString().padStart(3, '0')
  const objectKey = `${paddedReciterId}/${paddedSurahId}.ogg`
  
  try {
    // Check for Range header to determine request type
    const rangeHeader = event.node.req.headers.range
    
    if (rangeHeader) {
      // Handle Range Request (for seeking)
      const parts = rangeHeader.replace(/bytes=/, '').split('-')
      const start = parts[0] ? parseInt(parts[0], 10) : 0
      const end = parts[1] ? parseInt(parts[1], 10) : undefined
      
      // Get object with range
      const object = await bucket.get(objectKey, {
        range: end !== undefined ? { offset: start, length: end - start + 1 } : { offset: start }
      })
      
      if (!object) {
        throw createError({ statusCode: 404, statusMessage: 'Audio file not found' })
      }
      
      // Get total file size for Content-Range header
      const fullObject = await bucket.head(objectKey)
      if (!fullObject) {
        throw createError({ statusCode: 404, statusMessage: 'Audio file not found' })
      }
      
      const totalSize = fullObject.size || 0
      if (totalSize === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Audio file size unavailable' })
      }
      const actualEnd = end !== undefined ? Math.min(end, totalSize - 1) : totalSize - 1
      
      // Validate range
      if (start >= totalSize || (end !== undefined && start > end)) {
        setResponseStatus(event, 416, 'Requested Range Not Satisfiable')
        setResponseHeader(event, 'Content-Range', `bytes */${totalSize}`)
        return new Response(null, { status: 416 })
      }
      
      // Build response headers for partial content with Howler.js optimization
      const headers = new Headers()
      if (object.writeHttpMetadata) {
        object.writeHttpMetadata(headers)
      }
      
      headers.set('Content-Type', 'audio/ogg')
      headers.set('Accept-Ranges', 'bytes')
      headers.set('Content-Range', `bytes ${start}-${actualEnd}/${totalSize}`)
      headers.set('Content-Length', (actualEnd - start + 1).toString())
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      headers.set('Access-Control-Allow-Origin', '*')
      headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Type')
      headers.set('Vary', 'Accept-Encoding')
      
      // Add CloudFlare-specific optimizations
      headers.set('CF-Cache-Tag', `audio-${reciterNumber}-${surahNumber}`)
      headers.set('CDN-Cache-Control', 'public, max-age=31536000')
      
      return new Response(object.body, {
        status: 206, // Partial Content
        headers
      })
      
    } else {
      // Handle Full File Request
      const object = await bucket.get(objectKey)
      
      if (!object) {
        throw createError({ statusCode: 404, statusMessage: 'Audio file not found' })
      }
      
      // Build response headers for full file with Howler.js optimization
      const headers = new Headers()
      if (object.writeHttpMetadata) {
        object.writeHttpMetadata(headers)
      }
      
      headers.set('Content-Type', 'audio/ogg')
      headers.set('Accept-Ranges', 'bytes')
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      headers.set('Access-Control-Allow-Origin', '*')
      headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Type')
      headers.set('Vary', 'Accept-Encoding')
      
      // Add CloudFlare-specific optimizations
      headers.set('CF-Cache-Tag', `audio-${reciterNumber}-${surahNumber}`)
      headers.set('CDN-Cache-Control', 'public, max-age=31536000')
      
      return new Response(object.body, {
        status: 200, // OK
        headers
      })
    }
    
  } catch (error: unknown) {
    console.error('R2 Error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Audio retrieval failed' })
  }
})
