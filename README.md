# VidCamp - Video Editor

A sleek, browser-based video editor with a bold retro design. Stack videos, images, and text with precise timing control and real-time preview. Export your compositions using FFMPEG.

## Demo Video
https://github.com/user-attachments/assets/147cec99-d05a-4f89-a89e-02abf7422623


## Features

- Drag & drop media handling
- Multi-track video, image, and text composition
- trimming the vieo by grabing it from arrow at right end
- Frame-accurate trimming with visual preview
- Live playback with frame-by-frame preview marker
- Customizable text overlays with full styling control
- Video speed and volume adjustment
- forward rewind by 10 seconds buttons
- resize media by shrinking and incrementing media by selecting them
- Export to single video file


# Tech stack
- Next JS
- tailwind
- zustand
- shad CN

# UI images Showcase

### Timeline and Preview
The main workspace with preview window and multi-track timeline
![Starting screen](https://live.staticflickr.com/65535/54259935250_bb47275d1a_k.jpg)

---

### Text Customization
Fine-tune text appearance with color, background, and positioning, width, height, border-radius, etc
![Text modification panel](https://live.staticflickr.com/65535/54259749534_f40f5693db_k.jpg)

---

### Video Controls  
Adjust speed, volume, and trim points
![Video adjustment panel](https://live.staticflickr.com/65535/54259737473_4a0d7938ca_k.jpg)

---

### Image Editing
Control size, position, and visual effects
![Image modification panel](https://github.com/user-attachments/assets/fa2f94eb-3bbb-49d5-9454-d96c88fd2bd4)

---

### Multi-track Layout
Stack and arrange multiple videos and text overlays
![Multiple tracks view](https://live.staticflickr.com/65535/54259738773_f060c635d0_k.jpg)

---

### Visual Timeline
Precise control with frame markers and playhead
![Timeline view](https://live.staticflickr.com/65535/54259935260_8453ef7063_k.jpg)

---

### Export Options
Convert your composition into a single video file
![Export screen](https://live.staticflickr.com/65535/54259750839_e5515289b9_k.jpg)

## Setup Instructions

### Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Backend Setup (Required for Export Functionality)

To enable video export, you need to run the backend server:

1. **Clone the backend repository:**
   ```bash
   git clone https://github.com/Abenaitwe/vidcamp-backend
   cd vidcamp-backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install FFMPEG:**
   - **MacOS:** `brew install ffmpeg`
   - **Ubuntu/Debian:** `sudo apt-get install ffmpeg`
   - **Windows:** Download from [ffmpeg.org](https://ffmpeg.org/download.html)

4. **Run the backend server:**
   ```bash
   python main.py
   # or
   uvicorn main:app --reload
   ```
   
   The server should start on `http://127.0.0.1:8000`

5. **Configure the backend URL (Optional):**
   - Copy `.env.local.example` to `.env.local`
   - Update `NEXT_PUBLIC_BACKEND_URL` if your backend runs on a different port

### Using the Export Feature

1. Create your video composition
2. Click the Export button in the left panel
3. Wait for processing (can take 15-30 seconds depending on video length)
4. Your video will download automatically as `final_video.mp4`

---

## Development and Todo
- [ ] Transitions between clips
- [ ] Video splitting functionality
- [ ] Drag and drop media across timeline
- [ ] Cloud-based export option
- [ ] More text animation presets

---

## Links
- [Backend Repository](https://github.com/Abenaitwe/vidcamp-backend)
- [Report Issues](https://github.com/Abenaitwe/vidcamp/issues)

---

**Note:** This is a work in progress. Bug reports and feature requests are welcome!

⭐ **Don't forget to star the repo!**
