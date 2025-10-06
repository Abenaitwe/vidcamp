// FFmpeg Web Worker for client-side video processing
// This worker handles heavy video processing without blocking the UI

importScripts('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js');
importScripts('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js');

const { FFmpeg } = FFmpegWASM;
const { fetchFile, toBlobURL } = FFmpegUtil;

let ffmpeg = null;
let isLoaded = false;

// Initialize FFmpeg
async function loadFFmpeg() {
  if (isLoaded) return;
  
  try {
    ffmpeg = new FFmpeg();
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    isLoaded = true;
    self.postMessage({ type: 'loaded' });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
}

// Process video with overlays
async function processVideo(data) {
  const { videos, images, texts, canvasWidth, canvasHeight } = data;
  
  try {
    // Load FFmpeg if not already loaded
    if (!isLoaded) {
      await loadFFmpeg();
    }
    
    self.postMessage({ type: 'progress', message: 'Loading video files...', progress: 10 });
    
    // Write video files to FFmpeg's virtual file system
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      await ffmpeg.writeFile(`input${i}.mp4`, await fetchFile(video.src));
    }
    
    self.postMessage({ type: 'progress', message: 'Loading images...', progress: 30 });
    
    // Write image files
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      await ffmpeg.writeFile(`image${i}.png`, await fetchFile(image.src));
    }
    
    self.postMessage({ type: 'progress', message: 'Processing video...', progress: 50 });
    
    // Build FFmpeg command
    const filterComplex = buildFilterComplex(videos, images, texts, canvasWidth, canvasHeight);
    
    // Execute FFmpeg command
    await ffmpeg.exec([
      '-i', 'input0.mp4',
      '-filter_complex', filterComplex,
      '-map', '[outv]',
      '-map', '0:a?',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      'output.mp4'
    ]);
    
    self.postMessage({ type: 'progress', message: 'Finalizing...', progress: 90 });
    
    // Read the output file
    const data_out = await ffmpeg.readFile('output.mp4');
    
    self.postMessage({ 
      type: 'complete', 
      data: data_out,
      progress: 100 
    });
    
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
}

// Build FFmpeg filter complex string
function buildFilterComplex(videos, images, texts, canvasWidth, canvasHeight) {
  let filters = [];
  let inputIndex = 0;
  
  // Base video input
  filters.push(`[0:v]scale=${canvasWidth}:${canvasHeight}[base]`);
  
  let currentStream = 'base';
  
  // Add image overlays
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const nextStream = `img${i}`;
    
    filters.push(
      `[${inputIndex + 1}:v]scale=${img.width}:${img.height}[scaled_img${i}]`,
      `[${currentStream}][scaled_img${i}]overlay=${img.x - img.width/2}:${img.y - img.height/2}:enable='between(t,${img.startTime},${img.endTime})'[${nextStream}]`
    );
    
    currentStream = nextStream;
    inputIndex++;
  }
  
  // Add text overlays
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const nextStream = i === texts.length - 1 ? 'outv' : `txt${i}`;
    
    const escapedText = text.description.replace(/'/g, "\\'").replace(/:/g, "\\:");
    const fontsize = text.fontSize || 24;
    const fontcolor = (text.color || '#FFFFFF').replace('#', '');
    
    filters.push(
      `[${currentStream}]drawtext=text='${escapedText}':fontsize=${fontsize}:fontcolor=0x${fontcolor}:x=${text.x - text.width/2}:y=${text.y - text.height/2}:enable='between(t,${text.startTime},${text.endTime})'[${nextStream}]`
    );
    
    currentStream = nextStream;
  }
  
  return filters.join(';');
}

// Listen for messages
self.onmessage = async (e) => {
  const { type, data } = e.data;
  
  switch (type) {
    case 'load':
      await loadFFmpeg();
      break;
    case 'process':
      await processVideo(data);
      break;
    default:
      break;
  }
};
