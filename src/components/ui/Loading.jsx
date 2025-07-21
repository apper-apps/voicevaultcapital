import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const LoadingSkeleton = ({ className }) => (
  <div className={cn("animate-pulse", className)}>
    <div className="glass rounded-lg h-4 mb-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
    <div className="glass rounded-lg h-4 w-3/4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  </div>
);

const Loading = ({ type = "default", message = "Loading..." }) => {
  if (type === "table") {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 glass rounded-lg animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </div>
              <div className="flex-1 space-y-2">
                <LoadingSkeleton />
              </div>
              <div className="w-16">
                <LoadingSkeleton />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-6">
            <div className="space-y-4">
              <div className="w-full h-32 glass rounded-lg animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </div>
              <LoadingSkeleton />
              <LoadingSkeleton className="w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
        <ApperIcon 
          name="Loader2" 
          size={24} 
          className="absolute inset-0 m-auto text-primary animate-spin" 
        />
      </div>
      <p className="mt-4 text-white/60 font-medium">{message}</p>
    </div>
  );
};

export default Loading;