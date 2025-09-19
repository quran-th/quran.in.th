#!/bin/bash

# Enhanced Deploy with Intelligent Cache Busting for Cloudflare Workers
# This script builds, injects cache version, deploys, and performs selective cache purging

set -e

echo "🚀 Starting enhanced deployment with intelligent cache busting..."

# Generate cache version based on build timestamp and git commit
BUILD_TIMESTAMP=$(date +%s)
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
CACHE_VERSION="2025-v${BUILD_TIMESTAMP}-${GIT_COMMIT}"

echo "📋 Generated cache version: $CACHE_VERSION"

# Inject cache version into Service Worker before build
echo "🔧 Injecting cache version into Service Worker..."
sed -i.bak "s/const CACHE_VERSION = self.__CACHE_VERSION__ || '[^']*'/const CACHE_VERSION = self.__CACHE_VERSION__ || '$CACHE_VERSION'/" public/sw.js

# Build the application
echo "📦 Building application with cache version $CACHE_VERSION..."
npm run build

# Restore original Service Worker (remove .bak file)
echo "🔄 Restoring original Service Worker template..."
mv public/sw.js.bak public/sw.js 2>/dev/null || true

# Deploy to Cloudflare Workers
echo "☁️ Deploying to Cloudflare Workers..."
npm run deploy

# Intelligent cache purging
echo "🧹 Performing selective cache purging..."

if [ -n "$CF_ZONE_ID" ] && [ -n "$CF_API_TOKEN" ]; then
    # Purge specific critical paths instead of everything
    echo "🎯 Purging critical HTML and Service Worker files..."
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
         -H "Authorization: Bearer $CF_API_TOKEN" \
         -H "Content-Type: application/json" \
         --data '{
           "files": [
             "https://quran.in.th/",
             "https://quran.in.th/index.html",
             "https://quran.in.th/sw.js",
             "https://quran.in.th/manifest.json"
           ]
         }' \
         --silent --show-error --fail

    echo "🗑️ Purging outdated Nuxt assets..."
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
         -H "Authorization: Bearer $CF_API_TOKEN" \
         -H "Content-Type: application/json" \
         --data '{
           "prefixes": [
             "https://quran.in.th/_nuxt/"
           ]
         }' \
         --silent --show-error --fail

    echo "✅ Selective cache purging completed successfully!"
else
    echo "⚠️  Warning: CF_ZONE_ID and CF_API_TOKEN not set. Cache not purged."
    echo "   Set these environment variables to enable automatic cache purging:"
    echo "   export CF_ZONE_ID=your_zone_id"
    echo "   export CF_API_TOKEN=your_api_token"
fi

# Cache validation
echo "🔍 Validating deployment..."
sleep 3 # Give CDN time to propagate

# Test if the main page loads without 404s
echo "🌐 Testing main page accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://quran.in.th/" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Deployment validation successful! (HTTP $HTTP_STATUS)"
else
    echo "⚠️  Warning: Main page returned HTTP $HTTP_STATUS"
fi

echo "🎉 Enhanced deployment completed successfully!"
echo "📱 Cache version: $CACHE_VERSION"
echo "🔄 Service Worker will automatically update for all users"
echo "💡 No manual refresh required - users will get updates seamlessly"