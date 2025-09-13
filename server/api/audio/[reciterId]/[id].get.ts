export default defineEventHandler(async (event) => {
  // Handle CORS preflight requests
  if (event.node.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, If-None-Match, If-Match, If-Modified-Since, If-Unmodified-Since',
        'Access-Control-Max-Age': '86400',
      },
    })
  }
  
  // Get parameters from the dynamic route [reciterId]/[id]
  const reciterId = getRouterParam(event, 'reciterId')
  const surahId = getRouterParam(event, 'id')
  
  // Validate reciter ID
  if (!reciterId || isNaN(Number(reciterId))) {
    return new Response('Invalid reciter ID', { status: 400 })
  }
  
  // Validate surah ID
  if (!surahId || isNaN(Number(surahId))) {
    return new Response('Invalid surah ID', { status: 400 })
  }
  
  const reciterNumber = parseInt(reciterId)
  const surahNumber = parseInt(surahId)
  if (surahNumber < 1 || surahNumber > 114) {
    return new Response('Surah ID must be between 1 and 114', { status: 400 })
  }
  
  try {
    // R2 Bucket streaming for production with new directory structure
    const paddedSurahId = surahNumber.toString().padStart(3, '0')
    const paddedReciterId = reciterNumber.toString().padStart(3, '0')
    const objectKey = `${paddedReciterId}/${paddedSurahId}.ogg`

    // Access R2 bucket from Cloudflare Workers binding
    const bucket = event.context.cloudflare?.env?.AUDIO_BUCKET
    
    if (!bucket) {
      return new Response('R2 bucket not available', { status: 503 })
    }
    
    // Convert Node.js headers to Web API Headers for R2
    const requestHeaders = new Headers()
    Object.entries(event.node.req.headers).forEach(([key, value]) => {
      if (value) {
        const headerValue = Array.isArray(value) ? value[0] : value
        if (headerValue) {
          requestHeaders.set(key, headerValue)
        }
      }
    })
    
    const object = await bucket.get(objectKey, {
      range: requestHeaders,
      onlyIf: requestHeaders,
    })
    
    if (object === null) {
      return new Response('Audio file not found', { status: 404 })
    }
    
    // Create response headers following Workers pattern
    const headers = new Headers()
    
    // Use R2 object's built-in HTTP metadata
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    
    // Add audio-specific headers optimized for streaming
    headers.set('Content-Type', 'audio/ogg')
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Cache-Control', 'public, max-age=31536000, stale-while-revalidate=86400')
    headers.set('Connection', 'keep-alive')
    headers.set('X-Content-Type-Options', 'nosniff')
    
    // Enable partial content support for better mobile streaming
    if (event.node.req.headers.range) {
      headers.set('Content-Range', object.range || '')
    }
    
    // CORS headers
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Range, If-None-Match, If-Match, If-Modified-Since, If-Unmodified-Since')
    headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges')
    
    return new Response('body' in object ? object.body : undefined, {
      status: 'body' in object ? 200 : 412,
      headers,
    })
    
  } catch (error: unknown) {
    console.error('Error in audio API:', error)
    return new Response('Audio service temporarily unavailable', { status: 503 })
  }
})