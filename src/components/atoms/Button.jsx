import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ className, variant = "default", size = "md", children, icon, loading = false, ...props }, ref) => {
  const variants = {
    default: "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl",
    secondary: "glass hover:bg-white/10 text-white border border-white/20",
    ghost: "hover:bg-white/10 text-white",
    danger: "bg-gradient-to-r from-error to-red-600 hover:from-error/90 hover:to-red-600/90 text-white shadow-lg",
    success: "bg-gradient-to-r from-success to-green-600 hover:from-success/90 hover:to-green-600/90 text-white shadow-lg",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={loading}
      {...props}
    >
      {loading && <ApperIcon name="Loader2" size={16} className="animate-spin" />}
      {icon && !loading && <ApperIcon name={icon} size={16} />}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;