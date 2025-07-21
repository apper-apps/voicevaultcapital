import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data available", 
  message = "Get started by adding your first item",
  icon = "Inbox",
  actionLabel = "Get Started",
  onAction
}) => {
  return (
    <Card className="text-center py-16 border-dashed border-2 border-white/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <ApperIcon 
          name={icon} 
          size={40} 
          className="text-gradient" 
        />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/70 mb-8 max-w-md mx-auto leading-relaxed">{message}</p>
      {onAction && (
        <Button onClick={onAction} variant="default" icon="Plus" size="lg">
          {actionLabel}
        </Button>
      )}
      <div className="mt-8 text-xs text-white/40">
        Ready to transform your audio into actionable insights?
      </div>
    </Card>
  );
};

export default Empty;