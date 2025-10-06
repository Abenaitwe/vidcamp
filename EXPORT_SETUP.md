# VidCamp Export System - Technical Documentation

## Overview

VidCamp uses a **hybrid export system** that intelligently chooses between client-side and cloud processing based on file size. This document provides technical details for developers and contributors.

## Architecture

### Client-Side Export (≤ 20MB)

```
User → FFmpeg Service → FFmpeg.wasm → Browser Processing → Download
```

**Components:**
- `src/lib/ffmpeg-service.js` - FFmpeg WebAssembly wrapper
- `src/hooks/useVideoExport.js` - React hook for export management
- `@ffmpeg/ffmpeg` - WebAssembly FFmpeg core
- `@ffmpeg/util` - FFmpeg utility functions

**Flow:**
1. Load FFmpeg WebAssembly core (preloaded on app start)
2. Write video/image files to virtual filesystem
3. Build FFmpeg filter complex for overlays
4. Execute FFmpeg command in browser
5. Read output and trigger download

**Advantages:**
- Zero latency - instant processing
- 100% private - files never leave device
- No server costs
- Works offline (after first load)

**Limitations:**
- Browser memory constraints
- Processing power limited to device
- File size limited to 20MB

### Cloud Export (> 20MB)

```
User → Next.js API Route → Server FFmpeg → Processing → Download
```

**Components:**
- `src/pages/api/export.js` - Next.js serverless function
- `formidable` - Multipart form parser
- Server-side FFmpeg installation

**Flow:**
1. Upload files to API endpoint
2. Parse multipart form data
3. Execute FFmpeg on server
4. Stream result back to client
5. Trigger download

**Advantages:**
- No file size limits
- Faster for large files
- More processing power
- Can handle complex operations

**Limitations:**
- Requires server/serverless setup
- Upload time for large files
- Server costs (if not on free tier)

## File Structure

```
vidcamp/
├── src/
│   ├── hooks/
│   │   └── useVideoExport.js          # Main export hook
│   ├── lib/
│   │   └── ffmpeg-service.js          # FFmpeg service singleton
│   └── pages/
│       └── api/
│           └── export.js              # Cloud export endpoint
├── public/
│   └── ffmpeg-worker.js               # Web Worker (optional)
└── .env.local.example                 # Environment config
```

## Configuration

### Environment Variables

```bash
# .env.local

# Optional: Custom cloud export endpoint
NEXT_PUBLIC_EXPORT_API_URL=/api/export

# For production, point to your serverless function
# NEXT_PUBLIC_EXPORT_API_URL=https://api.yoursite.com/export
```

### Thresholds

Edit in `src/lib/ffmpeg-service.js`:

```javascript
export const MAX_CLIENT_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_CLIENT_SIZE_MB = 20;
```

## FFmpeg Filter Complex

The system builds FFmpeg filter chains to apply overlays:

### Video Overlay
```
[0:v]scale=1920:1080[base];
[1:v]scale=640:480[scaled_v1];
[base][scaled_v1]overlay=400:300:enable='between(t,0,10)'[v1]
```

### Image Overlay
```
[v1][2:v]scale=200:200[scaled_img0];
[v1][scaled_img0]overlay=500:400:enable='between(t,2,8)'[img0]
```

### Text Overlay
```
[img0]drawtext=text='Hello World':fontsize=48:fontcolor=0xFFFFFF:x=640:y=360:enable='between(t,0,15)'[outv]
```

## Error Handling

### Client-Side Errors

**FFmpeg Load Failure:**
```javascript
try {
  await ffmpegService.load();
} catch (error) {
  // Fallback to cloud export
  return await exportCloudSide(...);
}
```

**Processing Failure:**
- Clear FFmpeg cache
- Retry once
- Show error toast
- Suggest cloud export

### Cloud Export Errors

**Upload Failure:**
- Check file size
- Verify network connection
- Show progress feedback

**Server Error:**
- Check FFmpeg installation
- Verify API route configuration
- Review server logs

## Performance Optimization

### Client-Side

1. **Preload FFmpeg:**
   ```javascript
   useEffect(() => {
     preloadFFmpeg();
   }, []);
   ```

2. **Cleanup Temp Files:**
   ```javascript
   await ffmpeg.deleteFile('input.mp4');
   ```

3. **Use Fast Preset:**
   ```javascript
   '-preset', 'fast'
   ```

### Cloud Export

1. **Stream Processing:**
   - Process in chunks
   - Stream output to client

2. **Optimize FFmpeg:**
   ```bash
   -preset medium
   -crf 23
   -movflags +faststart
   ```

3. **Cleanup:**
   - Delete temp files immediately
   - Use tmp directory

## Testing

### Test Client Export

```javascript
// Small test file
const testVideo = {
  src: 'blob:http://localhost:3000/...',
  startTime: 0,
  endTime: 5,
  duration: 5,
  // ... other properties
};

await exportVideo({
  videos: [testVideo],
  images: [],
  texts: [],
  canvasWidth: 1920,
  canvasHeight: 1080,
});
```

### Test Cloud Export

```bash
# Ensure FFmpeg is installed
ffmpeg -version

# Test API endpoint
curl -X POST http://localhost:3000/api/export \
  -F "videos=@test.mp4" \
  -F "metadata={\"videos\":[...],\"images\":[],\"texts\":[]}"
```

## Deployment

### Vercel

1. **Deploy:**
   ```bash
   vercel deploy
   ```

2. **Add FFmpeg:**
   - Vercel includes FFmpeg by default
   - No additional configuration needed

### Netlify

1. **Install FFmpeg Layer:**
   ```toml
   [build]
   command = "npm run build"
   
   [functions]
   external_node_modules = ["formidable"]
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### Self-Hosted

1. **Install FFmpeg:**
   ```bash
   sudo apt-get install ffmpeg
   ```

2. **Build:**
   ```bash
   npm run build
   npm start
   ```

## Troubleshooting

### "FFmpeg failed to load"

**Cause:** CDN blocked or slow connection

**Solution:**
1. Check internet connection
2. Verify CDN accessibility
3. Clear browser cache
4. Try different browser

### "Export failed" (Client-Side)

**Cause:** Browser memory limit exceeded

**Solution:**
1. System automatically retries with cloud export
2. Reduce video quality/length
3. Close other tabs

### "Cloud export failed"

**Cause:** FFmpeg not installed on server

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# Verify installation
ffmpeg -version
```

## Advanced Usage

### Custom Export Preset

```javascript
// In ffmpeg-service.js
const args = [
  '-i', 'input.mp4',
  '-c:v', 'libx264',
  '-preset', 'ultrafast',  // Custom preset
  '-crf', '18',            // Higher quality
  '-c:a', 'aac',
  '-b:a', '192k',          // Higher audio bitrate
  'output.mp4'
];
```

### Progress Callbacks

```javascript
const { exportVideo } = useVideoExport();

await exportVideo({
  videos,
  images,
  texts,
  canvasWidth: 1920,
  canvasHeight: 1080,
  onProgress: ({ progress, message }) => {
    console.log(`${message}: ${progress}%`);
  }
});
```

## Contributing

When contributing to the export system:

1. Test both client and cloud paths
2. Handle errors gracefully
3. Provide progress feedback
4. Clean up temporary files
5. Update documentation

## Resources

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [FFmpeg.wasm GitHub](https://github.com/ffmpegwasm/ffmpeg.wasm)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Formidable Documentation](https://github.com/node-formidable/formidable)

---

For questions or issues, please open a GitHub issue.
