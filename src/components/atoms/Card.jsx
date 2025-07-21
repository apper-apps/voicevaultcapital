import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ className, children, hover = true, ...props }, ref) => {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6",
        hover && "hover:bg-white/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;