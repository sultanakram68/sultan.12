import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "neon" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

/**
 * Reusable Shadcn-style Button Component
 * 
 * FOR STUDENTS:
 * Notice how we use 'variant' props to switch styling dynamically.
 * The 'neon' variant adds our custom electric green glow!
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neon-green disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      default: "bg-white text-neon-dark hover:bg-gray-200",
      neon: "bg-neon-green text-neon-dark shadow-neon-glow hover:shadow-neon-glow-lg hover:bg-orange-500 transform hover:-translate-y-0.5",
      outline: "border-2 border-neon-green text-neon-green hover:bg-neon-green/10 shadow-[0_0_10px_rgba(255,103,0,0.2)]",
      ghost: "text-gray-300 hover:text-neon-green hover:bg-white/5",
    };

    const sizes = {
      sm: "px-4 py-1.5 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-3.5 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
