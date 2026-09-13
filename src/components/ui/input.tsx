import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  togglePassword?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, togglePassword, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative w-full">
        <input
          type={type === "password" && showPassword ? "text" : type}
          className={cn(
            "flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            togglePassword && "pr-12",
            className
          )}
          ref={ref}
          {...props}
        />
        {togglePassword && type === "password" && (
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-sm text-muted-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
