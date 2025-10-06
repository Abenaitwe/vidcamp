# VidCamp - Video Editor

A retro-style, browser-based video editor built with Next.js and ShadCN. Stack videos, images, and text with precise timing control and real-time preview. Features a **hybrid export system** that processes small files instantly in your browser and automatically scales to cloud processing for larger projects.

## ✨ Features

- 🎬 Drag-and-drop media import
- 📐 Resize media elements by selecting and adjusting dimensions
- ✂️ Trim clips by dragging from the right edge
- ⚡ Adjustable video speed and volume controls
- ▶️ Real-time playback with frame-by-frame preview
- 📝 Fully customizable text overlays with styling options
- 🎞️ Multi-track composition for videos, images, and text
- 🎯 Frame-accurate trimming with visual feedback
- ⏩ Quick 10-second forward and rewind buttons
- 💾 **Hybrid Export System**
  - ⚡ Client-side processing for files ≤ 20MB (instant!)
  - ☁️ Cloud processing for larger files (automatic)
  - 📊 Real-time progress feedback
  - 🚀 No backend setup required

## 🎨 Tech Stack

- **Frontend**: Next.js 14, React 18
- **UI**: Tailwind CSS, ShadCN UI Components
- **State Management**: Zustand
- **Video Processing**: 
  - FFmpeg WebAssembly (client-side)
  - FFmpeg (cloud processing)
- **Styling**: Retro-inspired bold design theme

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Abenaitwe/vidcamp.git
cd vidcamp

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💡 Export System

VidCamp features an intelligent **hybrid export system** that automatically chooses the best processing method:

### Client-Side Export (Files ≤ 20MB)
- ⚡ **Instant processing** directly in your browser
- 🔒 **100% private** - files never leave your device
- 🚀 **No setup required** - works out of the box
- 🎯 **Perfect for**: Short clips, quick edits, demos

### Cloud Export (Files > 20MB)
- ☁️ **Automatic fallback** when files exceed 20MB
- 💪 **Powerful processing** using server-side FFmpeg
- 📊 **Progress tracking** with real-time updates
- 🎯 **Perfect for**: Long videos, complex compositions, high-quality exports

### How It Works

1. **Create your composition** - Add videos, images, and text
2. **Click Export** - The system automatically detects file size
3. **Sit back** - Watch real-time progress updates
4. **Download** - Your video downloads automatically when complete

**No configuration needed!** The system intelligently chooses the best method for your project.

## 🔧 Configuration (Optional)

### Environment Variables

Create a `.env.local` file (copy from `.env.local.example`):

```bash
# Optional: Custom cloud export endpoint
# NEXT_PUBLIC_EXPORT_API_URL=/api/export
```

### Cloud Export Setup (For Self-Hosting)

The built-in API route (`/api/export`) works automatically. For production deployments:

1. **Ensure FFmpeg is installed** on your server:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install ffmpeg
   
   # MacOS
   brew install ffmpeg
   
   # Windows
   # Download from https://ffmpeg.org/download.html
   ```

2. **Deploy to Vercel/Netlify/Railway** - The API route works automatically

3. **(Optional) Use a custom serverless function**:
   - Set `NEXT_PUBLIC_EXPORT_API_URL` to your custom endpoint
   - The endpoint should accept multipart form data with videos, images, and metadata

## 📖 Usage Guide

### Basic Workflow

1. **Upload Video**: Click the video icon or drag and drop
2. **Add Elements**: 
   - Click the text icon to add text overlays
   - Click the image icon to add images
3. **Edit**: 
   - Drag elements to reposition
   - Resize by dragging corners
   - Adjust timing in the timeline
4. **Export**: Click the download icon and wait for processing

### Keyboard Shortcuts

- `Escape` - Close menus
- `Space` - Play/Pause (when timeline is focused)

## 🖼️ UI Showcase

### Timeline and Preview
![Starting screen](https://live.staticflickr.com/65535/54259935250_bb47275d1a_k.jpg)

### Text Customization
![Text modification panel](https://live.staticflickr.com/65535/54259749534_f40f5693db_k.jpg)

### Video Controls  
![Video adjustment panel](https://live.staticflickr.com/65535/54259737473_4a0d7938ca_k.jpg)

### Image Editing
![Image modification panel](https://github.com/user-attachments/assets/fa2f94eb-3bbb-49d5-9454-d96c88fd2bd4)

### Multi-track Layout
![Multiple tracks view](https://live.staticflickr.com/65535/54259738773_f060c635d0_k.jpg)

### Visual Timeline
![Timeline view](https://live.staticflickr.com/65535/54259935260_8453ef7063_k.jpg)

### Export Options
![Export screen](https://live.staticflickr.com/65535/54259750839_e5515289b9_k.jpg)

## 🔮 Roadmap

- [ ] Transitions between clips
- [ ] Video splitting functionality
- [ ] Drag and drop media across timeline
- [ ] Audio waveform visualization
- [ ] More text animation presets
- [ ] Video filters and effects
- [ ] Custom export quality settings
- [ ] Project save/load functionality

## 🐛 Troubleshooting

### Client-Side Export Issues

**Problem**: Export fails with "FFmpeg failed to load"
- **Solution**: Clear browser cache and reload. Ensure you have a stable internet connection (FFmpeg core files are loaded from CDN).

**Problem**: Export is slow
- **Solution**: For files > 20MB, the system automatically uses cloud processing which is faster.

### Cloud Export Issues

**Problem**: "Cloud export failed"
- **Solution**: Check that FFmpeg is installed on your server. For local development, ensure the Next.js dev server is running.

**Problem**: "Upload failed" or timeout errors
- **Solution**: Your file may be too large. Try trimming the video or reducing the number of overlays.

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

- [Report Issues](https://github.com/Abenaitwe/vidcamp/issues)
- [GitHub Repository](https://github.com/Abenaitwe/vidcamp)

---

**Made with ❤️ by the VidCamp Team**

⭐ **Don't forget to star the repo if you find it useful!**
