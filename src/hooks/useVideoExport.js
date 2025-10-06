/**
 * Video Export Hook
 * Manages hybrid export system (client-side and cloud)
 */

import { useState, useCallback } from 'react';
import { ffmpegService, MAX_CLIENT_SIZE, MAX_CLIENT_SIZE_MB } from '@/lib/ffmpeg-service';

export const useVideoExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState('');
  const [exportMode, setExportMode] = useState(null); // 'client' or 'cloud'

  /**
   * Check if files can be processed client-side
   */
  const checkFileSize = async (videos, images) => {
    try {
      const totalSize = await ffmpegService.calculateTotalSize(videos, images);
      return {
        totalSize,
        canProcessLocally: totalSize <= MAX_CLIENT_SIZE,
        sizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      console.error('Error checking file size:', error);
      return {
        totalSize: 0,
        canProcessLocally: false,
        sizeMB: '0'
      };
    }
  };

  /**
   * Export using client-side FFmpeg
   */
  const exportClientSide = async ({ videos, images, texts, canvasWidth, canvasHeight }) => {
    setExportMode('client');
    setExportMessage('Processing locally...');
    setExportProgress(5);

    try {
      // Process video
      const blob = await ffmpegService.processVideo(
        { videos, images, texts, canvasWidth, canvasHeight },
        ({ progress, message }) => {
          setExportProgress(progress);
          setExportMessage(message);
        }
      );

      setExportMessage('Download starting...');
      setExportProgress(100);

      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vidcamp_export_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true, mode: 'client' };
    } catch (error) {
      throw new Error(`Client-side export failed: ${error.message}`);
    }
  };

  /**
   * Export using cloud API
   */
  const exportCloudSide = async ({ videos, images, texts, canvasWidth, canvasHeight }) => {
    setExportMode('cloud');
    setExportMessage('Uploading to cloud...');
    setExportProgress(10);

    try {
      const formData = new FormData();

      // Normalize and add videos
      const normalizedVideos = videos.map((video) => ({
        ...video,
        startTime: parseFloat(video.startTime),
        endTime: parseFloat(video.endTime),
        duration: parseFloat(video.duration),
      }));

      for (const video of normalizedVideos) {
        const response = await fetch(video.src);
        const blob = await response.blob();
        const file = new File([blob], `${video.id}.mp4`, { type: 'video/mp4' });
        formData.append('videos', file);
      }

      setExportProgress(30);
      setExportMessage('Uploading images...');

      // Normalize and add images
      const normalizedImages = images.map((image) => ({
        ...image,
        startTime: parseFloat(image.startTime),
        endTime: parseFloat(image.endTime),
        x: parseInt(image.x),
        y: parseInt(image.y),
        width: parseInt(image.width),
        height: parseInt(image.height),
        opacity: parseInt(image.opacity),
      }));

      for (const image of normalizedImages) {
        const response = await fetch(image.src);
        const blob = await response.blob();
        const file = new File([blob], `${image.id}.png`, { type: 'image/png' });
        formData.append('images', file);
      }

      setExportProgress(50);
      setExportMessage('Processing on cloud...');

      // Normalize and add texts
      const normalizedTexts = texts.map((text) => ({
        ...text,
        startTime: parseFloat(text.startTime),
        endTime: parseFloat(text.endTime),
        x: parseInt(text.x),
        y: parseInt(text.y),
        fontSize: parseInt(text.fontSize),
        opacity: parseInt(text.opacity),
      }));

      // Add metadata
      formData.append(
        'metadata',
        JSON.stringify({
          videos: normalizedVideos,
          images: normalizedImages,
          texts: normalizedTexts,
        })
      );
      formData.append('canvas_width', canvasWidth.toString());
      formData.append('canvas_height', canvasHeight.toString());

      // Get API URL from environment or use default
      const apiUrl = process.env.NEXT_PUBLIC_EXPORT_API_URL || '/api/export';

      // Send to API
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Cloud export failed with status ${response.status}`);
      }

      setExportProgress(90);
      setExportMessage('Downloading...');

      // Download the result
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vidcamp_export_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportProgress(100);
      setExportMessage('Export complete!');

      return { success: true, mode: 'cloud' };
    } catch (error) {
      throw new Error(`Cloud export failed: ${error.message}`);
    }
  };

  /**
   * Main export function - decides between client and cloud
   */
  const exportVideo = useCallback(async ({ videos, images, texts, canvasWidth, canvasHeight }) => {
    setIsExporting(true);
    setExportProgress(0);
    setExportMessage('Checking file size...');

    try {
      // Check file size
      const sizeInfo = await checkFileSize(videos, images);

      if (sizeInfo.canProcessLocally) {
        // Use client-side export
        setExportMessage(`Processing locally (${sizeInfo.sizeMB}MB)...`);
        return await exportClientSide({ videos, images, texts, canvasWidth, canvasHeight });
      } else {
        // Use cloud export
        setExportMessage(`File size (${sizeInfo.sizeMB}MB) exceeds ${MAX_CLIENT_SIZE_MB}MB. Using cloud export...`);
        return await exportCloudSide({ videos, images, texts, canvasWidth, canvasHeight });
      }
    } catch (error) {
      setExportMessage('Export failed');
      throw error;
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        setExportMessage('');
        setExportMode(null);
      }, 2000);
    }
  }, []);

  /**
   * Preload FFmpeg for faster first export
   */
  const preloadFFmpeg = useCallback(async () => {
    try {
      await ffmpegService.load();
      console.log('FFmpeg preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload FFmpeg:', error);
    }
  }, []);

  return {
    exportVideo,
    preloadFFmpeg,
    isExporting,
    exportProgress,
    exportMessage,
    exportMode,
    MAX_CLIENT_SIZE_MB,
  };
};
