/**
 * Cloud Export API Route
 * Handles video export for files larger than 20MB using FFmpeg
 * 
 * This is a serverless function that processes videos on the server
 */

import formidable from 'formidable';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Parse form data
 */
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const uploadDir = path.join(os.tmpdir(), 'video-export');
    
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 500 * 1024 * 1024, // 500MB max
      multiples: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

/**
 * Build FFmpeg command for video processing
 */
function buildFFmpegCommand(videoFiles, imageFiles, metadata, outputPath) {
  const { videos, images, texts } = JSON.parse(metadata.metadata[0]);
  const canvasWidth = parseInt(metadata.canvas_width[0]);
  const canvasHeight = parseInt(metadata.canvas_height[0]);

  let args = ['-y']; // Overwrite output

  // Add video inputs
  const videoArray = Array.isArray(videoFiles.videos) ? videoFiles.videos : [videoFiles.videos];
  videoArray.forEach((file) => {
    args.push('-i', file.filepath);
  });

  // Add image inputs
  if (imageFiles.images) {
    const imageArray = Array.isArray(imageFiles.images) ? imageFiles.images : [imageFiles.images];
    imageArray.forEach((file) => {
      args.push('-i', file.filepath);
    });
  }

  // Build filter complex
  const filters = [];
  
  filters.push(`[0:v]scale=${canvasWidth}:${canvasHeight},setsar=1[base]`);
  
  let currentStream = 'base';
  let inputIndex = 1;

  // Add additional videos
  for (let i = 1; i < videos.length; i++) {
    const video = videos[i];
    const nextStream = `v${i}`;
    
    filters.push(
      `[${inputIndex}:v]scale=${video.width}:${video.height}[scaled_v${i}]`,
      `[${currentStream}][scaled_v${i}]overlay=${video.x - video.width/2}:${video.y - video.height/2}:enable='between(t,${video.startTime},${video.endTime})'[${nextStream}]`
    );
    
    currentStream = nextStream;
    inputIndex++;
  }

  // Add image overlays
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const nextStream = `img${i}`;
    
    filters.push(
      `[${inputIndex}:v]scale=${img.width}:${img.height}[scaled_img${i}]`,
      `[${currentStream}][scaled_img${i}]overlay=${img.x - img.width/2}:${img.y - img.height/2}:enable='between(t,${img.startTime},${img.endTime})'[${nextStream}]`
    );
    
    currentStream = nextStream;
    inputIndex++;
  }

  // Add text overlays
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const nextStream = i === texts.length - 1 ? 'outv' : `txt${i}`;
    
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

  // Add remaining arguments
  args.push(
    '-filter_complex', filters.join(';'),
    '-map', '[outv]',
    '-map', '0:a?',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    outputPath
  );

  return args;
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFiles = [];

  try {
    // Parse form data
    const { fields, files } = await parseForm(req);

    // Prepare output path
    const outputPath = path.join(os.tmpdir(), `output-${Date.now()}.mp4`);
    tempFiles.push(outputPath);

    // Track uploaded files for cleanup
    const allFiles = { ...files };
    Object.values(allFiles).flat().forEach(file => {
      if (file.filepath) tempFiles.push(file.filepath);
    });

    // Build FFmpeg command
    const ffmpegArgs = buildFFmpegCommand(
      { videos: files.videos },
      { images: files.images },
      fields,
      outputPath
    );

    // Execute FFmpeg
    const command = `ffmpeg ${ffmpegArgs.join(' ')}`;
    console.log('Executing FFmpeg:', command);

    await execAsync(command, { maxBuffer: 50 * 1024 * 1024 });

    // Read output file
    const outputBuffer = await fs.readFile(outputPath);

    // Set response headers
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="final_video.mp4"');
    res.setHeader('Content-Length', outputBuffer.length);

    // Send file
    res.status(200).send(outputBuffer);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Export failed', 
      message: error.message 
    });
  } finally {
    // Cleanup temporary files
    for (const file of tempFiles) {
      try {
        await fs.unlink(file);
      } catch (e) {
        console.warn('Failed to delete temp file:', file);
      }
    }
  }
}
