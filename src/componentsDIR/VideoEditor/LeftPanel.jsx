"use client";

import { memo, useState, useRef, useEffect, useCallback } from "react";
import { Video, Image, Type, Upload, X, Download, Loader2, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVideoStore } from "@/State/store";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useVideoExport } from "@/hooks/useVideoExport";

const LeftPanel = memo(() => {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);
  const videos = useVideoStore((state) => state.videos);
  const images = useVideoStore((state) => state.images);
  const addImageOnTL = useVideoStore((state) => state.addImageOnTL);
  const deleteImageFromTL = useVideoStore((state) => state.deleteImageFromTL);
  const deleteVideo = useVideoStore((state) => state.deleteVideo);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const addTextsOnTL = useVideoStore((state) => state.addTextsOnTL);
  const texts = useVideoStore((state) => state.texts);
  const deleteTextFromTL = useVideoStore((state) => state.deleteTextFromTL);
  
  // Hybrid export system
  const { 
    exportVideo, 
    preloadFFmpeg,
    isExporting, 
    exportProgress, 
    exportMessage,
    exportMode,
    MAX_CLIENT_SIZE_MB 
  } = useVideoExport();

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Preload FFmpeg on component mount
  useEffect(() => {
    preloadFFmpeg();
  }, [preloadFFmpeg]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fileInputRef = useRef(null);

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
          toggleMenu(null);
        };
        videos.forEach((vid) => {
         const individualVideo =  document.querySelector(`div[data-id="${vid.id}"] > video`);
          if(individualVideo) individualVideo.currentTime = 0
        })
        reader.readAsArrayBuffer(file);
      }
    },
    [addVideo]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Hybrid export handler
  const handleExport = async () => {
    try {
      toast({
        title: exportMessage || "Starting export...",
        description: "This may take a moment",
      });

      const result = await exportVideo({
        videos,
        images,
        texts,
        canvasWidth: window.innerWidth,
        canvasHeight: 680,
      });

      toast({
        title: "Export complete! 🎉",
        description: `Video exported successfully using ${result.mode === 'client' ? 'local processing' : 'cloud processing'}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
      console.error("Export error:", error);
    }
  };
  return (
    <div className="fixed left-8 z-[4] top-[37%] transform -translate-y-1/2" ref={menuRef}>
      <TooltipProvider>
        <div className="bg-white border-6 border-retro-navy rounded-2xl shadow-[6px_6px_0px_0px_rgba(27,58,87,1)] flex flex-col space-y-2 p-3">
          <MenuButton icon={<Video className="h-5 w-5" />} tooltip="Upload Video" onClick={() => toggleMenu("video")} />
          <MenuButton icon={<Type className="h-5 w-5" />} tooltip="Add Text" onClick={() => toggleMenu("text")} />
          <MenuButton icon={<Image className="h-5 w-5" />} tooltip="Upload Photo" onClick={() => toggleMenu("photo")} />
          <MenuButton
            icon={<Download className="h-5 w-5" />}
            tooltip="Export and download"
            onClick={() => toggleMenu("export")}
          />
        </div>

        {openMenu === "video" && (
          <MenuContent key={"1"}>
            <Tabs defaultValue="your-media" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="your-media" className="flex-1">
                  Your Media
                </TabsTrigger>
                <TabsTrigger value="upload-new" className="flex-1">
                  Upload New
                </TabsTrigger>
              </TabsList>
              <TabsContent value="your-media" className="mt-0">
                <div className="flex flex-wrap gap-5 justify-start mx-auto max-h-[240px] overflow-y-auto pr-2">
                  {videos.map((video, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 rounded-lg bg-accent/50 border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
                    >
                      <div className="flex flex-col h-full ">
                        <div className="relative flex w-full justify-end">
                          <X
                            onClick={() => {
                              deleteVideo(video.id);
                            }}
                            className="absolute bg-black pointer-events-auto z-[1] cursor-pointer p-[1px] text-white rounded-full border border-gray-400"
                            size={20}
                          />
                        </div>
                        <video
                          src={video.src}
                          className="h-full w-full rounded-md object-cover"
                          preload="metadata"
                          muted
                          playsInline
                          onLoadedData={(e) => {
                            const videoEl = e.currentTarget;
                            videoEl.currentTime = 8; // Set to first frame
                          }}
                        />
                      </div>
                    </div>
                    // <div
                    //   key={index}
                    //   className="w-16 h-16 rounded-lg bg-accent/50 border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
                    // >
                    //   <Video className="w-6 h-6 text-muted-foreground" />
                    // </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="upload-new" className="mt-0">
                <Label
                  htmlFor="video-upload"
                  className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <span>Upload Video</span>
                  </div>
                  <Input
                    ref={fileInputRef}
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </Label>
              </TabsContent>
            </Tabs>
          </MenuContent>
        )}

        {openMenu === "photo" && (
          <MenuContent key={2}>
            <Tabs defaultValue="upload-new" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="upload-new" className="flex-1">
                  Upload New
                </TabsTrigger>
                <TabsTrigger value="your-media" className="flex-1">
                  Your Media
                </TabsTrigger>
              </TabsList>
              <TabsContent value="your-media" className="mt-0">
                <div className="flex flex-wrap gap-5 ustify-start mx-auto max-h-[240px] overflow-y-auto pr-2">
                  {images.length === 0 && (
                    <div className="w-full text-center text-muted-foreground py-4">No images added</div>
                  )}
                  {images.map((item, index) => (
                    <div key={index} className="flex flex-col h-full ">
                      <div className="relative flex w-full justify-end">
                        <X
                          onClick={() => {
                            deleteImageFromTL(item.id);
                          }}
                          className="absolute bg-black pointer-events-auto z-[1] cursor-pointer p-[1px] text-white rounded-full border border-gray-400"
                          size={20}
                        />
                      </div>
                      <div
                        key={index}
                        className="w-16 h-16 rounded-lg bg-accent/50 border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
                      >
                        <img src={item.src} className="w-16 h-16 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="upload-new" className="mt-0">
                <Label
                  htmlFor="photo-upload"
                  className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <span>Upload Photo</span>
                  </div>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (
                        !addImageOnTL(file, {
                          width: window.innerWidth - 100,
                          height: window.innerHeight - 100,
                        })
                      ) {
                        toast({
                          title: "Image size must be less than 2MB",
                        });
                        return;
                      }
                      toggleMenu(null);
                    }}
                  />
                </Label>
              </TabsContent>
            </Tabs>
          </MenuContent>
        )}

        {openMenu === "text" && (
          <MenuContent key={3}>
            <Tabs defaultValue="add-text" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="add-text" className="flex-1">
                  Add Text
                </TabsTrigger>
                <TabsTrigger value="your-texts" className="flex-1">
                  Your Texts
                </TabsTrigger>
              </TabsList>
              <TabsContent value="add-text" className="mt-0">
                <div className="flex justify-center gap-4 flex-col h-28">
                  <Input
                    placeholder="Enter your text"
                    className="h-9"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (text.trim() === "") {
                          toast({
                            title: "Text cannot be empty",
                            duration: 2000,
                          });
                        } else {
                          addTextsOnTL(text, false, {
                            width: window.innerWidth - 100,
                            height: window.innerHeight - 100,
                          });
                          setText("");
                          toggleMenu(null);
                        }
                      }
                    }}
                    ref={(el) => el && el.focus()}
                  />
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (text.trim() === "") {
                        toast({
                          title: "Text cannot be empty",
                          duration: 2000,
                        });
                      } else {
                        addTextsOnTL(text, false, {
                          width: window.innerWidth - 100,
                          height: window.innerHeight - 100,
                        });
                        setText("");
                        toggleMenu(null);
                      }
                    }}
                  >
                    Add Text
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="your-texts" className="mt-0">
                <div className="flex flex-wrap gap-3 justify-start mx-auto max-h-[240px] overflow-y-auto pr-2">
                  {texts.length === 0 ? (
                    <div className="w-full text-center text-muted-foreground py-4">No texts added</div>
                  ) : (
                    texts.map((text, index) => (
                      <div key={index} className="flex w-full h-full items-center gap-4">
                        <div className="bg-accent/20 rounded-md border border-gray-600 p-2 text-sm break-all w-[94%]">
                          {text.description}
                        </div>
                        <div className="relative">
                          <X
                            onClick={() => {
                              deleteTextFromTL(text.id);
                            }}
                            className=" bg-black pointer-events-auto z-[1] cursor-pointer p-[1px] text-white rounded-full border border-gray-400"
                            size={20}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </MenuContent>
        )}
        {openMenu === "export" && (
          <MenuContent key={3}>
            <p className="text-xl font-black text-retro-navy mb-3 mt-2">Export Video</p>
            
            <div className="bg-retro-cream-dark border-4 border-retro-navy rounded-xl p-3 mb-4">
              <p className="text-xs font-bold text-retro-navy mb-2">📦 Smart Export System</p>
              <p className="text-xs text-retro-navy/80 font-semibold">
                • Files ≤ {MAX_CLIENT_SIZE_MB}MB: Instant local processing<br/>
                • Files &gt; {MAX_CLIENT_SIZE_MB}MB: Cloud processing
              </p>
            </div>

            <Button 
              disabled={isExporting} 
              className="w-full" 
              onClick={handleExport}
            >
              {isExporting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin flex-shrink-0 w-5 h-5" />
                  <div className="flex flex-col items-start">
                    <span className="text-xs">{exportMessage}</span>
                    <span className="text-xs opacity-80">{exportProgress}%</span>
                  </div>
                </div>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Export Video
                </>
              )}
            </Button>

            {exportMode && (
              <p className="text-xs text-retro-navy/70 mt-3 font-semibold text-center">
                {exportMode === 'client' ? '⚡ Processing locally' : '☁️ Processing on cloud'}
              </p>
            )}

            <p className="text-xs text-retro-navy/60 my-3 font-bold text-center">
              No setup required! Export works instantly in your browser.
            </p>
          </MenuContent>
        )}
      </TooltipProvider>
    </div>
  );
});
LeftPanel.displayName = "LeftPanel";

export default LeftPanel;

function MenuButton({ icon, tooltip, onClick }) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-retro-cream-dark text-retro-navy border-0 shadow-none" onClick={onClick}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-retro-navy text-white border-4 border-retro-navy-dark font-bold">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function MenuContent({ children }) {
  return (
    <div className="absolute bg-white left-full ml-7 top-0 w-72 border-6 border-retro-navy rounded-2xl shadow-[8px_8px_0px_0px_rgba(27,58,87,1)] p-5 transition-all ease-out duration-300 transform translate-y-0 opacity-100 animate-slide-up">
      {children}
    </div>
  );
}
