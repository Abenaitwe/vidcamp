"use client";

import { useState, useRef, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useVideoStore } from "@/State/store";
import { useToast } from "@/hooks/use-toast";
import { Upload, Code } from "lucide-react";

const VideoUploader = memo(() => {
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [isLoadingForDemoVideo, setIsLoadingForDemoVideo] = useState(false);

  const addVideo = useVideoStore((state) => state.addVideo);

  const handleUpload = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith("video/")) {
        setIsUploading(true);
        const reader = new FileReader();
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress((e.loaded / e.total) * 100);
          }
        };
        reader.onload = (e) => {
          const blob = new Blob([e.target.result], { type: file.type });
          const url = URL.createObjectURL(blob);
          setIsUploading(false);
          setProgress(0);

          // a temp video element to get duration
          const video = document.createElement("video");
          video.src = url;
          video.onloadedmetadata = () => {
            const duration = video.duration;
            const canUpload = addVideo({
              videoBlob: blob,
              duration,
              isPlaying: false,
              currentTime: 0,
              startTime: 0,
              endTime: duration,
            });

            if (!canUpload) {
              toast({
                title: "Sorry, the video is too long!",
                description: "Maximum allowed duration is 25 minutes",
              });
            }
          };
        };
        reader.readAsArrayBuffer(file);
      }
    },
    [addVideo]
  );

  const handleDemoPreview = async () => {
    setIsLoadingForDemoVideo(true);
    try {
      const response = await fetch(
        "https://res.cloudinary.com/dbm0lqxsayooletsgognnnasdnasdn/video/upload/v1738497117/countingstars_aagare.mp4"
      );

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      const video = document.createElement("video");
      video.src = url;

      video.onloadedmetadata = () => {
        const duration = video.duration;
        addVideo({
          videoBlob: blob,
          duration,
          isPlaying: false,
          currentTime: 0,
          startTime: 0,
          endTime: duration,
        });
      };

      video.onerror = () => {
        toast({
          title: "Error loading demo video",
          variant: "destructive",
        });
        setIsLoadingForDemoVideo(false);
      };
    } catch (error) {
      console.error("Error loading demo video:", error);
      toast({
        title: "Error loading demo video",
        variant: "destructive",
      });
    } finally {
      setIsLoadingForDemoVideo(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-retro-cream">
      <div className="w-full max-w-4xl px-4">
        <div className="bg-white border-8 border-retro-navy rounded-3xl shadow-[12px_12px_0px_0px_rgba(27,58,87,1)] p-12 space-y-12">
          <div className="space-y-6 text-center">
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl text-retro-navy uppercase" style={{ textShadow: '4px 4px 0px rgba(255,107,107,0.3)' }}>
              Open Source Video Editor
            </h1>
            <p className="text-xl text-retro-navy/80 max-w-2xl mx-auto font-bold">
              Unleash your creativity with our powerful, free, and open-source video editing platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <a className="w-full max-w-md" href="https://github.com/Abenaitwe/vidcamp" target="_blank">
                <Button variant="secondary" className="w-full">
                  <Code className="w-5 h-5 mr-2" />
                  View on GitHub
                </Button>
              </a>
            </div>
          </div>
          <div className="gap-6 max-w-2xl w-full mx-auto">
            <div onClick={() => fileInputRef.current.click()} className="space-y-4 w-full">
              <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
              <div className="w-full h-56 border-8 border-dashed border-retro-navy bg-retro-cream-dark hover:bg-retro-cream transition-all duration-300 rounded-2xl flex flex-col items-center justify-center space-y-4 cursor-pointer shadow-[6px_6px_0px_0px_rgba(27,58,87,1)] hover:shadow-[8px_8px_0px_0px_rgba(27,58,87,1)] hover:translate-y-[-2px]">
                <Upload className="w-16 h-16 text-retro-navy" />
                <span className="font-bold text-xl text-retro-navy">Upload Your Video</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-8">
              <div className="bg-retro-navy h-1 w-1/2 rounded-full"></div>
              <p className="font-black text-retro-navy text-xl">OR</p>
              <div className="bg-retro-navy h-1 w-1/2 rounded-full"></div>
            </div>

            <Button onClick={handleDemoPreview} disabled={isLoadingForDemoVideo} className="mt-8 w-full text-lg">
              Try with Demo Video {isLoadingForDemoVideo && <Loader />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoUploader.displayName = "VideoUploader";
export default VideoUploader;

const Cloud = () => {
  return (
    <svg
      width="50"
      height="36"
      className="!w-20 !h-20"
      viewBox="0 0 50 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.75 36H12.625C9.2125 36 6.29725 34.8187 3.87925 32.4562C1.45975 30.0937 0.25 27.2062 0.25 23.7937C0.25 20.8687 1.13125 18.2625 2.89375 15.975C4.65625 13.6875 6.9625 12.225 9.8125 11.5875C10.75 8.1375 12.625 5.34375 15.4375 3.20625C18.25 1.06875 21.4375 0 25 0C29.3875 0 33.109 1.52775 36.1645 4.58325C39.2215 7.64025 40.75 11.3625 40.75 15.75C43.3375 16.05 45.4848 17.1653 47.1918 19.0958C48.8973 21.0278 49.75 23.2875 49.75 25.875C49.75 28.6875 48.766 31.0785 46.798 33.048C44.8285 35.016 42.4375 36 39.625 36H27.25V19.9125L30.85 23.4L34 20.25L25 11.25L16 20.25L19.15 23.4L22.75 19.9125V36Z"
        fill="#F8F8F8"
      />
    </svg>
  );
};

const Loader = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="ml-2 animate-spin !w-5 !h-5"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};
