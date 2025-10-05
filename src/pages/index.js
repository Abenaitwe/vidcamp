import { Inter } from "next/font/google";
import VideoEditor from "@/componentsDIR/VideoEditor/VideoEditor";
import { AlertCircle, Laptop } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });//

export default function Home() {
  return (
    <main className={`flex min-h-screen flex-col items-center justify-between bg-retro-cream ${inter.className}`}>
      <div className="lg:flex hidden w-full min-h-screen flex-col">
        <VideoEditor />
      </div>
      <div className="min-h-screen lg:hidden bg-retro-cream text-retro-navy flex items-center justify-center p-6">
        <div className="text-center space-y-6 bg-white border-8 border-retro-navy rounded-3xl shadow-[12px_12px_0px_0px_rgba(27,58,87,1)] p-12 max-w-md">
          <Laptop className="w-20 h-20 mx-auto text-retro-navy" />
          <h1 className="text-3xl font-black text-retro-navy uppercase">Desktop Only</h1>
          <p className="text-base text-retro-navy/80 font-bold">
            The editor works only on desktop. Please come back using a computer for the best experience.
          </p>
          <AlertCircle className="w-12 h-12 mx-auto text-retro-coral" />
        </div>
      </div>
    </main>
  );
}
