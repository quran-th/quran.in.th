export default defineEventHandler(async (event) => {
  // Access Cloudflare environment variables via context.env
  const env = event.context.cloudflare?.env || {}
  
  // Get USE_LOCAL_AUDIO from Cloudflare environment variables
  const useLocalAudio = env.USE_LOCAL_AUDIO === 'true'
  
  return {
    useLocalAudio
  }
})