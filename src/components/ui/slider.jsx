import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}>
    <SliderPrimitive.Track
      className="relative h-3 w-full grow overflow-hidden rounded-full bg-retro-cream-dark border-3 border-retro-navy">
      <SliderPrimitive.Range className="absolute h-full bg-retro-coral" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-6 w-6 rounded-full border-4 border-retro-navy bg-white ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-retro-coral/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(27,58,87,1)] hover:shadow-[3px_3px_0px_0px_rgba(27,58,87,1)] cursor-pointer" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
