# Changelog

All notable changes to the VidCamp project will be documented in this file.

## [2.0.0] - Hybrid Export System - 2025-01-XX

### 🎉 Major Features

#### Hybrid Export System
- **Client-Side Export**: Process videos ≤ 20MB instantly in the browser using FFmpeg WebAssembly
- **Cloud Export**: Automatic fallback for files > 20MB using Next.js API routes
- **Smart Detection**: Automatically chooses optimal processing method based on file size
- **Real-Time Progress**: Live progress updates and status messages during export
- **Zero Setup**: Works out of the box with no backend configuration required

### ✨ New Features

- FFmpeg WebAssembly integration for client-side video processing
- Web Worker support for non-blocking processing (optional)
- Cloud export API endpoint (`/api/export`)
- Real-time export progress tracking
- File size detection and automatic mode selection
- Toast notifications for export status
- Export preloading for faster first-time usage

### 🔧 Technical Improvements

- Added `@ffmpeg/ffmpeg` and `@ffmpeg/util` dependencies
- Created `ffmpeg-service.js` for FFmpeg management
- Created `useVideoExport` hook for React integration
- Updated Next.js configuration for FFmpeg compatibility
- Added API route with formidable for file uploads
- Improved error handling with descriptive messages
- Added CORS headers for API routes

### 📝 Documentation

- Comprehensive README with hybrid export documentation
- Technical documentation in `EXPORT_SETUP.md`
- Environment variable examples in `.env.local.example`
- Troubleshooting guide for common issues
- Deployment instructions for various platforms

### 🎨 UI Improvements

- New export menu with smart system indicator
- Progress bar with percentage and status messages
- Mode indicator (client/cloud) during processing
- Retro-styled export UI components
- Better loading states and feedback

### 🗑️ Removed

- Legacy backend configuration (`export.config.js`)
- Old backend URL environment variable
- Backend server dependency
- Manual backend setup requirements

### 🔄 Migration Notes

If upgrading from v1.x:

1. **No backend needed**: The old Python/FastAPI backend is no longer required
2. **Environment variables**: Remove `NEXT_PUBLIC_BACKEND_URL` if set
3. **Dependencies**: Run `npm install` to get new FFmpeg packages
4. **Configuration**: Review new `.env.local.example` file

### 🐛 Bug Fixes

- Fixed export failures for large files
- Improved error messages for failed exports
- Better handling of network interruptions
- Fixed memory leaks in FFmpeg processing

### ⚡ Performance

- Preload FFmpeg core for faster first export
- Optimized FFmpeg filter complex generation
- Reduced processing time for small files
- Improved cleanup of temporary files

### 🔒 Security

- Files processed client-side never leave the device
- Cloud processing uses temporary files with automatic cleanup
- No permanent storage of user videos
- CORS protection on API endpoints

---

## [1.0.0] - Initial Release - 2025-01-XX

### Features

- Video timeline editor
- Multi-track support for videos, images, and text
- Real-time preview
- Video trimming and speed control
- Text overlays with styling
- Image overlays with effects
- Frame-accurate editing
- Retro-inspired UI design
- Backend-based export (Python/FastAPI + FFmpeg)

---

## Version History

- **v2.0.0** - Hybrid Export System (Current)
- **v1.0.0** - Initial Release with Backend Export

---

For detailed information about each release, see the [Releases](https://github.com/Abenaitwe/vidcamp/releases) page.
