import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-4 border-retro-navy transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-retro-coral/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-retro-coral data-[state=unchecked]:bg-retro-cream-dark shadow-[3px_3px_0px_0px_rgba(27,58,87,1)]",
      className
    )}
    {...props}
    ref={ref}>
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white border-2 border-retro-navy shadow-[2px_2px_0px_0px_rgba(27,58,87,1)] ring-0 transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0.5"
      )} />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
