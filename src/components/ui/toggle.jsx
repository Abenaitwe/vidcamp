"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-bold ring-offset-white transition-all hover:bg-retro-cream-dark hover:text-retro-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-retro-coral/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-retro-coral data-[state=on]:text-white [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gap-2 border-4 border-retro-navy shadow-[3px_3px_0px_0px_rgba(27,58,87,1)] hover:shadow-[5px_5px_0px_0px_rgba(27,58,87,1)] hover:translate-y-[-2px]",
  {
    variants: {
      variant: {
        default: "bg-transparent text-retro-navy",
        outline:
          "border-4 border-retro-navy bg-white hover:bg-retro-cream-dark hover:text-retro-navy",
      },
      size: {
        default: "h-12 px-4 min-w-12",
        sm: "h-10 px-3 min-w-10",
        lg: "h-14 px-6 min-w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props} />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
