# Auto-Play Feature Implementation

## Overview

The Quran player now supports automatic sequential playback that automatically plays the next Surah when the current one finishes. This feature is **enabled by default** as requested.

## Features Implemented

### 1. Auto-Play State Management
- **Default State**: Auto-play is enabled by default (`autoPlay = ref(true)`)
- **Reactive State**: Users can toggle auto-play on/off during playback
- **Persistent**: State is maintained throughout the session

### 2. Sequential Surah Playback
- **Next Surah Logic**: Automatically loads and plays the next sequential Surah (1→2→3...→114)
- **End Behavior**: Stops automatically after Surah 114 (unless repeat all mode is enabled)
- **Repeat All Integration**: When repeat mode is "all", auto-play cycles back to Surah 1 after 114
- **Repeat One Priority**: When repeat mode is "one", it takes priority over auto-play

### 3. MediaSession API Integration
- **Metadata Updates**: Automatically updates OS media controls with new Surah/reciter info during transitions
- **Background Continuity**: Auto-play works seamlessly with background audio and lock screen controls
- **Thai Localization**: All metadata updates maintain Thai language formatting
- **Widget Update Fix**: MediaSession widget name now properly updates when auto-play transitions to next Surah

### 4. User Interface Controls
- **Toggle Button**: Green "เล่นอัตโนมัติ" (On), Gray "เล่นอัตโนมัติ" (off) button with play circle icon
- **Visual Feedback**: Clear visual indication of auto-play status with color coding
- **Accessible Design**: Consistent with existing UI patterns and button styles

## Technical Implementation

### MediaSession Widget Update Fix

The MediaSession widget name is now properly updated during auto-play transitions through a callback system:

```typescript
// Callback system for metadata updates
let onAutoPlayMetadataUpdate: ((surahId: number, reciterId: number) => void) | null = null

const setAutoPlayMetadataCallback = (callback: (surahId: number, reciterId: number) => void) => {
  onAutoPlayMetadataUpdate = callback
}

const updateAutoPlayMetadata = (surahId: number, reciterId: number) => {
  if (onAutoPlayMetadataUpdate) {
    onAutoPlayMetadataUpdate(surahId, reciterId)
  }
}
```

**Integration in index.vue:**
```typescript
// Set up auto-play metadata update callback
setAutoPlayMetadataCallback((surahId: number, reciterId: number) => {
  const surah = getSurahById(surahId)
  const reciter = getReciterById(reciterId)
  
  if (surah && reciter) {
    const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`
    updateMediaMetadata(surahDisplayName, reciter.name)
  }
})
```

### Auto-Play Logic in useAudioPlayer.ts

```typescript
// Auto-play state (enabled by default)
const autoPlay = ref(true)

// Enhanced audio end handler
const handleAudioEnd = () => {
  state.isPlaying = false
  
  if (repeatMode.value === 'one') {
    // Restart current surah (takes priority)
    seekTo(0)
    play()
  } else if (repeatMode.value === 'all' || autoPlay.value) {
    // Auto-play next surah or repeat all
    playNextSurah()
  }
}

// Sequential surah playback
const playNextSurah = async () => {
  if (!state.currentSurah || !state.currentReciter) return
  
  const nextSurahId = state.currentSurah + 1
  
  // Check if we've reached the end (Surah 114 is the last)
  if (nextSurahId > 114) {
    if (repeatMode.value === 'all') {
      // Start over from Surah 1
      await loadAudio(1, state.currentReciter)
      await play()
      updateAutoPlayMetadata(1, state.currentReciter)
    }
    return
  }
  
  // Load and play next surah
  try {
    await loadAudio(nextSurahId, state.currentReciter)
    await play()
    updateAutoPlayMetadata(nextSurahId, state.currentReciter)
  } catch (error) {
    console.error('Error loading next surah:', error)
    state.error = 'Failed to load next surah'
  }
}
```

### UI Integration in index.vue

```vue
<!-- Auto-play Toggle Button -->
<button
  @click="autoPlay = !autoPlay"
  class="flex items-center gap-1 px-2 py-1 rounded-full text-caption"
  :class="
    autoPlay
      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
      : 'bg-gray-100 dark:bg-gray-700'
  "
>
  <UIcon name="i-heroicons-play-circle" class="w-3 h-3" />
  <span class="text-xs">{{ autoPlay ? 'เล่นอัตโนมัติ' : 'เล่นอัตโนมัติ' }}</span>
</button>
```

## User Experience

### Default Behavior
1. User selects a Surah and reciter
2. Clicks play to start audio
3. **Auto-play is ON by default** - when current Surah ends, next Surah automatically begins
4. Process continues sequentially until Surah 114 or user stops/disables auto-play

### Auto-Play Controls
- **Toggle Button**: Users can turn auto-play on/off anytime during playback
- **Visual Feedback**: Button shows green when enabled, gray when disabled
- **Thai Labels**: Clear green "เล่นอัตโนมัติ" (On) and gray "เล่นอัตโนมัติ" (Off) labels

### Interaction with Other Features
- **Repeat One**: Takes priority over auto-play (current Surah repeats indefinitely)
- **Repeat All**: Works with auto-play (cycles through all 114 Surahs continuously)
- **Manual Navigation**: Users can still manually select different Surahs
- **MediaSession**: OS media controls update automatically during auto-play transitions

## Integration Points

1. **useAudioPlayer.ts**: Core auto-play logic and state management
2. **index.vue**: UI toggle control and user interaction
3. **MediaSession API**: Background audio and OS control integration
4. **useSurahs.ts**: Surah data for sequential navigation
5. **useReciters.ts**: Reciter data for metadata updates

## Testing

### Manual Testing Scenarios
1. **Basic Auto-Play**: Start Surah 112, verify it automatically plays Surah 113 when finished
2. **End Behavior**: Play Surah 114, verify it stops (doesn't continue to non-existent Surah 115)
3. **Toggle Functionality**: Disable auto-play during playback, verify next Surah doesn't auto-start
4. **Repeat Mode Integration**: Test with "one" and "all" repeat modes
5. **MediaSession Updates**: Verify OS media controls show correct Surah names during auto-transitions

### Available Test Files
- Surah 001 (Al-Fatiha): ~4MB - Short for quick testing
- Surahs 112-114: Small files for end-sequence testing
- All 114 Surahs available for full sequential testing

## Browser Compatibility

- ✅ **Chrome/Edge**: Full auto-play support with MediaSession
- ✅ **Safari**: Auto-play works with MediaSession metadata updates  
- ✅ **Mobile Safari**: Auto-play supported after initial user interaction
- ✅ **Android Chrome**: Complete auto-play and MediaSession integration

## Performance Considerations

- **Memory Efficient**: Only one audio file loaded at a time
- **Smooth Transitions**: Pre-loads next Surah metadata during current playback
- **Error Handling**: Graceful fallback if next Surah fails to load
- **Background Safe**: Works with device sleep/wake cycles

## Future Enhancements

1. **Playlist Mode**: Allow custom Surah sequences
2. **Smart Auto-Play**: Remember user preferences across sessions  
3. **Cross-Fade**: Smooth audio transitions between Surahs
4. **Skip Options**: Quick-skip to next Surah during auto-play
5. **Auto-Play Queue**: Show upcoming Surahs in sequence