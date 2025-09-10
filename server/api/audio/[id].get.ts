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
  
  // Get the surah ID from route parameter
  const surahId = getRouterParam(event, 'id')
  
  // Validate surah ID
  if (!surahId || isNaN(Number(surahId))) {
    return new Response('Invalid surah ID', { status: 400 })
  }
  
  const surahNumber = parseInt(surahId)
  if (surahNumber < 1 || surahNumber > 114) {
    return new Response('Surah ID must be between 1 and 114', { status: 400 })
  }
  
  // Generate object key with zero-padding
  const paddedId = surahNumber.toString().padStart(3, '0')
  const objectKey = `${paddedId}.mp3`
  
  try {
    // Access R2 bucket from Cloudflare Workers binding
    const bucket = event.context.cloudflare?.env?.AUDIO_BUCKET
    
    if (!bucket) {
      console.error('R2 bucket not available')
      return new Response('Audio service temporarily unavailable', { status: 503 })
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
      console.error('Audio file not found:', objectKey)
      return new Response('Audio file not found', { status: 404 })
    }
    
    // Create response headers following Workers pattern
    const headers = new Headers()
    
    // Use R2 object's built-in HTTP metadata
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    
    // Add audio-specific headers optimized for streaming
    headers.set('Content-Type', 'audio/mpeg')
    headers.set('Accept-Ranges', 'bytes')
    
    // Optimized caching for audio streaming
    // Allow stale content while revalidating to prevent interruptions
    headers.set('Cache-Control', 'public, max-age=31536000, stale-while-revalidate=86400')
    
    // Streaming optimizations for Howler.js
    headers.set('Connection', 'keep-alive')
    headers.set('X-Content-Type-Options', 'nosniff')
    
    // Enable partial content support for better mobile streaming
    if (event.node.req.headers.range) {
      headers.set('Content-Range', object.range || '')
    }
    
    // CORS headers for cross-origin requests with expanded headers for streaming
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Range, If-None-Match, If-Match, If-Modified-Since, If-Unmodified-Since')
    headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges')
    
    // When no body is present, preconditions have failed
    return new Response('body' in object ? object.body : undefined, {
      status: 'body' in object ? 200 : 412,
      headers,
    })
    
  } catch (error: any) {
    console.error('Error accessing R2 bucket:', error)
    return new Response('Failed to access audio file', { status: 500 })
  }
})