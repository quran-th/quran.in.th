# MediaSession API Implementation for Background Audio

## Overview

The Quran player now supports background audio playback and OS-level media controls through the MediaSession API. This allows users to control audio playback from:

- Lock screen media controls
- Notification shade controls  
- Control Center (iOS) / Quick Settings (Android)
- Hardware media keys
- Bluetooth headphone controls

## Features Implemented

### 1. Background Audio Playback
- Audio continues playing when app is backgrounded
- Audio continues playing when device is locked
- Browser maintains audio session for uninterrupted playback

### 2. OS Media Widget Integration
- **Title**: Shows current Surah name in Thai (e.g., "ซูเราะฮฺ อัล-ฟาติหะฮฺ")
- **Artist**: Shows current reciter name
- **Album**: Shows "อัลกุรอาน - Al-Quran"
- **Artwork**: Uses app favicon as media artwork

### 3. Lock Screen Controls
- ▶️ **Play/Pause**: Standard play/pause functionality
- ⏮️ **Seek Backward**: 10-second rewind (customizable)
- ⏭️ **Seek Forward**: 10-second fast forward (customizable)
- 🎯 **Seek To Position**: Direct time seeking via progress bar
- 📍 **Position State**: Real-time progress updates every 5 seconds

### 4. Mobile PWA Support
- **Manifest**: Proper PWA manifest with Thai localization
- **Meta Tags**: Mobile-optimized meta tags for iOS/Android
- **App Mode**: Can be installed as standalone app
- **Theme Colors**: Consistent UI theming across OS integration

## Technical Implementation

### MediaSession API Usage

```typescript
// Initialize MediaSession handlers
navigator.mediaSession.setActionHandler('play', () => play())
navigator.mediaSession.setActionHandler('pause', () => pause())
navigator.mediaSession.setActionHandler('seekbackward', (details) => {
  const skipTime = details.seekOffset || 10
  seekTo(Math.max(0, currentTime - skipTime))
})
navigator.mediaSession.setActionHandler('seekforward', (details) => {
  const skipTime = details.seekOffset || 10  
  seekTo(Math.min(duration, currentTime + skipTime))
})

// Update metadata when audio loads
navigator.mediaSession.metadata = new MediaMetadata({
  title: "ซูเราะฮฺ อัล-ฟาติหะฮฺ",
  artist: "Reciter Name", 
  album: "อัลกุรอาน - Al-Quran",
  artwork: [{ src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' }]
})

// Update playback state
navigator.mediaSession.playbackState = 'playing' // or 'paused'

// Update position for progress tracking
navigator.mediaSession.setPositionState({
  duration: totalDuration,
  playbackRate: 1.0,
  position: currentTime
})
```

### Integration Points

1. **useAudioPlayer.ts**: Core MediaSession implementation
2. **index.vue**: Metadata updates when Surah/reciter changes
3. **nuxt.config.ts**: PWA manifest and mobile meta tags
4. **manifest.json**: PWA configuration with Thai localization

### Browser Compatibility

- ✅ **Chrome/Edge**: Full support on desktop and mobile
- ✅ **Safari**: Partial support (iOS 13.4+)
- ✅ **Firefox**: Basic support (desktop), limited mobile support
- ⚠️ **Mobile Safari**: Requires user interaction to start audio

### Mobile Considerations

#### iOS Safari
- Requires initial user tap to enable audio playback
- MediaSession metadata appears in Control Center
- Lock screen controls work after initial user interaction
- Background playback supported when added to home screen

#### Android Chrome
- Full MediaSession API support
- Notification shade controls
- Lock screen media controls
- Hardware key support (volume, play/pause)

## Testing Instructions

### Desktop Testing
1. Open app in Chrome/Edge
2. Start playing audio
3. Check browser media controls in toolbar
4. Test keyboard media keys (if available)

### Mobile Testing
1. Open app on mobile device
2. Start audio playback
3. Lock device - audio should continue
4. Check lock screen for media controls
5. Test notification shade controls
6. Try hardware button controls

### PWA Testing
1. Install app to home screen (Add to Home Screen)
2. Launch from home screen in standalone mode
3. Test background audio and OS controls
4. Verify app behaves like native media app

## Limitations and Workarounds

### Known Limitations
- **iOS Safari**: Requires user interaction before background audio
- **Data Usage**: No offline mode (streams from server)
- **Verse Timing**: Currently no verse-by-verse navigation via OS controls

### Implemented Workarounds
- **Auto-play Prevention**: User must tap play button first
- **Position Updates**: Throttled to every 5 seconds for performance
- **Fallback Icons**: Uses favicon when proper icons unavailable

## Future Enhancements

1. **Custom Icons**: Add proper 192x192 and 512x512 app icons
2. **Verse Navigation**: Previous/next verse via OS controls
3. **Playlist Mode**: Queue multiple Surahs for continuous playback
4. **Offline Support**: Cache audio files for offline playback
5. **Rich Notifications**: Enhanced notification content with verse info

## Configuration Files

- **nuxt.config.ts**: PWA meta tags and manifest link
- **public/manifest.json**: PWA manifest with Thai localization
- **composables/useAudioPlayer.ts**: MediaSession implementation
- **pages/index.vue**: Metadata updates and UI integration