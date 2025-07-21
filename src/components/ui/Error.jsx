import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry, showRetry = true }) => {
  const getErrorIcon = () => {
    if (message.toLowerCase().includes("network")) return "Wifi";
    if (message.toLowerCase().includes("permission")) return "ShieldAlert";
    return "AlertTriangle";
  };

  return (
    <Card className="text-center py-12 border-error/20 bg-error/5">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
        <ApperIcon 
          name={getErrorIcon()} 
          size={32} 
          className="text-error" 
        />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Oops! Something went wrong</h3>
      <p className="text-white/70 mb-6 max-w-md mx-auto leading-relaxed">{message}</p>
      {showRetry && onRetry && (
        <div className="space-y-3">
          <Button onClick={onRetry} variant="danger" icon="RefreshCw">
            Try Again
          </Button>
          <p className="text-xs text-white/50">
            If the problem persists, please check your internet connection
          </p>
        </div>
      )}
    </Card>
  );
};

export default Error;