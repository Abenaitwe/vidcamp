import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-retro-coral/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-4",
  {
    variants: {
      variant: {
        default: "bg-retro-coral text-white hover:bg-retro-coral-light border-retro-navy shadow-[4px_4px_0px_0px_rgba(27,58,87,1)] hover:shadow-[6px_6px_0px_0px_rgba(27,58,87,1)] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_rgba(27,58,87,1)] active:translate-y-[2px]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 border-retro-navy shadow-[4px_4px_0px_0px_rgba(27,58,87,1)] hover:shadow-[6px_6px_0px_0px_rgba(27,58,87,1)] hover:translate-y-[-2px]",
        outline:
          "border-retro-navy bg-retro-cream hover:bg-retro-cream-dark text-retro-navy shadow-[4px_4px_0px_0px_rgba(27,58,87,1)] hover:shadow-[6px_6px_0px_0px_rgba(27,58,87,1)] hover:translate-y-[-2px]",
        secondary:
          "bg-retro-navy text-white hover:bg-retro-navy-dark border-retro-navy-dark shadow-[4px_4px_0px_0px_rgba(15,38,56,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,38,56,1)] hover:translate-y-[-2px]",
        ghost: "border-transparent hover:bg-retro-cream-dark hover:text-retro-navy text-retro-navy shadow-none",
        link: "text-retro-navy underline-offset-4 hover:underline border-transparent shadow-none",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4",
        lg: "h-14 rounded-lg px-10 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
