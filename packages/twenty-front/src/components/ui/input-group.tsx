import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full items-stretch rounded-md border border-input bg-background ring-offset-background focus-within:ring-1 focus-within:ring-ring",
      className
    )}
    {...props}
  />
))
InputGroup.displayName = "InputGroup"

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "block-start" | "block-end"
  }
>(({ className, align = "block-start", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center px-3 py-2 text-sm",
      align === "block-start" ? "self-start" : "self-end",
      className
    )}
    {...props}
  />
))
InputGroupAddon.displayName = "InputGroupAddon"

const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    className={cn("shrink-0", className)}
    {...props}
  />
))
InputGroupButton.displayName = "InputGroupButton"

const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[60px] w-full resize-none border-0 bg-transparent px-3 py-2 text-base shadow-none placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className
    )}
    {...props}
  />
))
InputGroupTextarea.displayName = "InputGroupTextarea"

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea }
