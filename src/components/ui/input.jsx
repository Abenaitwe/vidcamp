import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border-4 border-retro-navy bg-white px-4 py-3 text-base font-bold text-retro-navy ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-retro-navy placeholder:text-retro-navy/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-retro-coral/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-[3px_3px_0px_0px_rgba(27,58,87,1)] focus:shadow-[5px_5px_0px_0px_rgba(27,58,87,1)]",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
