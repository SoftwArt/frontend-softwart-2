// src/shared/components/ui/textarea.tsx
// Cambio: agregar resize-y por defecto para que solo crezca en altura
import * as React from "react"
import { cn } from "@/src/shared/lib/utils"
 
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "resize-y",   // ← solo crece en alto, nunca en ancho
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"
 
export { Textarea }
 