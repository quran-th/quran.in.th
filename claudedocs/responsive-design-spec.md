# Responsive Design Specification

## Overview
Implementation of responsive audio player interface with two distinct layouts:
1. **Mobile**: Circular player with vertical layout
2. **Large Screen**: Hero section with playlist table and mini player

## Design System

### Color Palette
- **Primary Purple**: `#6366F1` (indigo-500)
- **Purple Gradient**: `from-indigo-500 to-purple-600`
- **Background**: `#F8FAFC` (slate-50) for light mode
- **Dark Background**: `#0F172A` (slate-900)
- **Text Primary**: `#1E293B` (slate-800)
- **Text Secondary**: `#64748B` (slate-500)
- **White/Light**: `#FFFFFF`
- **Card Background**: `#FFFFFF` with subtle shadow

### Typography
- **Heading**: Font weight 700 (bold)
- **Subheading**: Font weight 600 (semibold)
- **Body**: Font weight 400 (normal)
- **Caption**: Font weight 400, smaller size

### Spacing System
- **xs**: 4px
- **sm**: 8px  
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

## Mobile Layout (< 768px)

### Structure
```
┌─────────────────┐
│   Status Bar    │
├─────────────────┤
│  Now Playing    │
│  Track - Artist │
├─────────────────┤
│                 │
│   ┌─────────┐   │
│   │ Circular│   │
│   │ Progress│   │
│   │  Ring   │   │
│   │    ▶    │   │
│   └─────────┘   │
│                 │
├─────────────────┤
│   Track Title   │
│   Artist Name   │
├─────────────────┤
│  ⏮  ⏸  ⏭  ♡   │
├─────────────────┤
│  🔁 ➕ 🎚 🔀   │
└─────────────────┘
```

### Components
1. **Header Section**
   - Status indicator: "Now playing"
   - Current track and artist
   - Dropdown and playlist icons

2. **Circular Player**
   - Circular progress ring (purple)
   - Album artwork in center (circular)
   - Large play button overlay
   - Time display (-3:15)

3. **Track Info**
   - Track title (large, bold)
   - Artist name (medium, gray)

4. **Primary Controls**
   - Previous, Play/Pause, Next, Favorite
   - Purple accent on active states

5. **Secondary Controls**
   - Repeat, Add to playlist, Equalizer, Shuffle
   - Bottom row layout

## Large Screen Layout (≥ 768px)

### Structure
```
┌─────────────────────────────────────┐
│            Hero Section             │
│  Artist Name    Albums • Tracks     │
│  [PLAY] [FOLLOW]     Genre Tag      │
├─────────────────────────────────────┤
│          Popular Tracks             │
│  # │ TITLE    │ ARTIST │ TIME │ ALBUM │
│  1 │ Track 1  │ Artist │ 3:15 │ Album │
│  2 │ Track 2  │ Artist │ 2:59 │ Album │
├─────────────────────────────────────┤
│        Mini Player Bottom           │
│  🎵 Track • Artist    -3:15 ⏸ ───   │
└─────────────────────────────────────┘
```

### Components
1. **Hero Section**
   - Gradient background (purple)
   - Artist/content title (large, white text)
   - Metadata (albums, tracks count)
   - Primary action buttons (Play, Follow)
   - Genre/category tags

2. **Content Table**
   - Track listings with columns
   - Album artwork thumbnails
   - Hover states and interactions
   - "View All" action link

3. **Mini Player**
   - Fixed bottom position
   - Current track info and artwork
   - Time display and progress bar
   - Play/pause control
   - Compact design

## Responsive Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `≥ 1024px`

## Implementation Strategy

### Phase 1: Core Layout System
- Create responsive container components
- Implement breakpoint-based layout switching
- Set up design system utilities

### Phase 2: Mobile Implementation
- Circular progress component
- Mobile player controls
- Vertical layout optimization

### Phase 3: Large Screen Implementation
- Hero section component
- Playlist/table component
- Mini player component

### Phase 4: Integration & Polish
- Smooth transitions between layouts
- Consistent styling across breakpoints
- Performance optimization

## Technical Considerations
- Use CSS Grid and Flexbox for layouts
- Implement with Nuxt UI components where possible
- Maintain single codebase with conditional rendering
- Ensure accessibility across all screen sizes
- Test on various devices and screen sizes