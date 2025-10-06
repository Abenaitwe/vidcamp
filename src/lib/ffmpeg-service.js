/**
 * FFmpeg Service
 * Handles client-side video processing using FFmpeg WebAssembly
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

class FFmpegService {
  constructor() {
    this.ffmpeg = null;
    this.isLoaded = false;
    this.isLoading = false;
  }

  /**
   * Load FFmpeg core
   */
  async load(onProgress) {
    if (this.isLoaded) return;
    if (this.isLoading) {
      // Wait for existing load to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isLoading = true;

    try {
      this.ffmpeg = new FFmpeg();

      // Set up logging
      this.ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message);
      });

      // Set up progress monitoring
      this.ffmpeg.on('progress', ({ progress, time }) => {
        if (onProgress) {
          onProgress({
            progress: Math.round(progress * 100),
            message: `Processing... ${Math.round(progress * 100)}%`,
          });
        }
      });

      // Load FFmpeg core
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.isLoaded = true;
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      throw new Error(`Failed to load FFmpeg: ${error.message}`);
    }
  }

  /**
   * Process video with overlays
   */
  async processVideo({ videos, images, texts, canvasWidth, canvasHeight }, onProgress) {
    if (!this.isLoaded) {
      await this.load(onProgress);
    }

    try {
      onProgress?.({ progress: 10, message: 'Loading video files...' });

      // Write video files
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        await this.ffmpeg.writeFile(
          `input${i}.mp4`,
          await fetchFile(video.src)
        );
      }

      onProgress?.({ progress: 25, message: 'Loading images...' });

      // Write image files
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        await this.ffmpeg.writeFile(
          `image${i}.png`,
          await fetchFile(image.src)
        );
      }

      onProgress?.({ progress: 40, message: 'Building filter chain...' });

      // Build filter complex
      const filterComplex = this.buildFilterComplex(
        videos,
        images,
        texts,
        canvasWidth,
        canvasHeight
      );

      onProgress?.({ progress: 50, message: 'Processing video...' });

      // Execute FFmpeg command
      const args = ['-i', 'input0.mp4'];

      // Add additional video inputs
      for (let i = 1; i < videos.length; i++) {
        args.push('-i', `input${i}.mp4`);
      }

      // Add image inputs
      for (let i = 0; i < images.length; i++) {
        args.push('-i', `image${i}.png`);
      }

      args.push(
        '-filter_complex', filterComplex,
        '-map', '[outv]',
        '-map', '0:a?',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        'output.mp4'
      );

      await this.ffmpeg.exec(args);

      onProgress?.({ progress: 90, message: 'Reading output...' });

      // Read output file
      const data = await this.ffmpeg.readFile('output.mp4');

      onProgress?.({ progress: 100, message: 'Complete!' });

      // Create blob
      const blob = new Blob([data.buffer], { type: 'video/mp4' });

      // Cleanup
      await this.cleanup();

      return blob;
    } catch (error) {
      await this.cleanup();
      throw new Error(`Video processing failed: ${error.message}`);
    }
  }

  /**
   * Build FFmpeg filter complex string
   */
  buildFilterComplex(videos, images, texts, canvasWidth, canvasHeight) {
    const filters = [];
    
    // Scale base video
    filters.push(`[0:v]scale=${canvasWidth}:${canvasHeight},setsar=1[base]`);
    
    let currentStream = 'base';
    let videoInputIndex = 1;

    // Add additional videos (if any)
    for (let i = 1; i < videos.length; i++) {
      const video = videos[i];
      const nextStream = `v${i}`;
      
      filters.push(
        `[${videoInputIndex}:v]scale=${video.width}:${video.height}[scaled_v${i}]`,
        `[${currentStream}][scaled_v${i}]overlay=${video.x - video.width/2}:${video.y - video.height/2}:enable='between(t,${video.startTime},${video.endTime})'[${nextStream}]`
      );
      
      currentStream = nextStream;
      videoInputIndex++;
    }

    // Add image overlays
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const nextStream = `img${i}`;
      const inputIdx = videoInputIndex + i;
      
      filters.push(
        `[${inputIdx}:v]scale=${img.width}:${img.height}[scaled_img${i}]`,
        `[${currentStream}][scaled_img${i}]overlay=${img.x - img.width/2}:${img.y - img.height/2}:enable='between(t,${img.startTime},${img.endTime})'[${nextStream}]`
      );
      
      currentStream = nextStream;
    }

    // Add text overlays
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const nextStream = i === texts.length - 1 && images.length === 0 && videos.length === 1 ? 'outv' : `txt${i}`;
      
      const escapedText = text.description
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "'\\\\\\''")
        .replace(/:/g, '\\:');
      
      const fontsize = text.fontSize || 24;
      const fontcolor = (text.color || '#FFFFFF').replace('#', '');
      const x = Math.round(text.x - (text.width || 100) / 2);
      const y = Math.round(text.y - (text.height || 50) / 2);
      
      filters.push(
        `[${currentStream}]drawtext=text='${escapedText}':fontsize=${fontsize}:fontcolor=0x${fontcolor}:x=${x}:y=${y}:enable='between(t,${text.startTime},${text.endTime})'[${nextStream}]`
      );
      
      currentStream = nextStream;
    }

    // Ensure we end with 'outv'
    if (currentStream !== 'outv') {
      filters.push(`[${currentStream}]copy[outv]`);
    }

    return filters.join(';');
  }

  /**
   * Clean up temporary files
   */
  async cleanup() {
    if (!this.ffmpeg) return;

    try {
      const files = await this.ffmpeg.listDir('/');
      for (const file of files) {
        if (file.name && file.name !== '.' && file.name !== '..') {
          try {
            await this.ffmpeg.deleteFile(file.name);
          } catch (e) {
            // Ignore errors
          }
        }
      }
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  }

  /**
   * Calculate total file size
   */
  async calculateTotalSize(videos, images) {
    let totalSize = 0;

    for (const video of videos) {
      const response = await fetch(video.src);
      const blob = await response.blob();
      totalSize += blob.size;
    }

    for (const image of images) {
      const response = await fetch(image.src);
      const blob = await response.blob();
      totalSize += blob.size;
    }

    return totalSize;
  }
}

// Export singleton instance
export const ffmpegService = new FFmpegService();

// Export constants
export const MAX_CLIENT_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_CLIENT_SIZE_MB = 20;
