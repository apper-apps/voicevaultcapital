import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const MeetingSummary = ({ summary }) => {
  if (!summary) {
    return (
      <Card className="text-center py-12">
        <ApperIcon name="Brain" size={48} className="mx-auto text-white/40 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">AI Analysis Pending</h3>
        <p className="text-white/60">AI is processing the recording to generate insights</p>
      </Card>
    );
  }

  const getMeetingTypeIcon = (type) => {
    const typeMap = {
      "technical": "Code",
      "strategic": "Target", 
      "operational": "Settings",
      "planning": "Calendar",
      "review": "CheckCircle",
      "brainstorm": "Lightbulb"
    };
    return typeMap[type?.toLowerCase()] || "Users";
  };

  const getImportanceColor = (importance) => {
    if (importance >= 8) return "from-error to-red-600";
    if (importance >= 6) return "from-warning to-yellow-600";
    if (importance >= 4) return "from-accent to-cyan-600";
    return "from-success to-green-600";
  };

  const ActionItemCard = ({ item, index }) => (
    <div className="glass rounded-lg p-4 border-l-4 border-l-primary">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
            #{index + 1}
          </span>
          <span className="font-medium text-white">{item.assignee}</span>
        </div>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium",
          item.status === "completed" ? "bg-success/20 text-success" :
          item.status === "in-progress" ? "bg-warning/20 text-warning" :
          "bg-white/10 text-white/70"
        )}>
          {item.status || "pending"}
        </span>
      </div>
      <p className="text-white/90 mb-3">{item.task}</p>
      {item.deadline && (
        <div className="flex items-center gap-2 text-sm text-white/60">
          <ApperIcon name="Clock" size={14} />
          Due: {new Date(item.deadline).toLocaleDateString()}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
              <ApperIcon name={getMeetingTypeIcon(summary.meetingType)} size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{summary.topic || "Meeting Analysis"}</h2>
              <p className="text-white/60 capitalize">{summary.meetingType} Meeting</p>
            </div>
          </div>
          <div className={cn(
            "px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r text-white",
            getImportanceColor(summary.importance || 5)
          )}>
            Priority: {summary.importance || 5}/10
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decisions */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ApperIcon name="CheckCircle2" size={20} className="text-success" />
            <h3 className="text-lg font-semibold text-white">Key Decisions</h3>
          </div>
          {summary.decisions && summary.decisions.length > 0 ? (
            <div className="space-y-3">
              {summary.decisions.map((decision, index) => (
                <div key={index} className="flex items-start gap-3 p-3 glass rounded-lg">
                  <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ApperIcon name="Check" size={12} className="text-success" />
                  </div>
                  <p className="text-white/90 leading-relaxed">{decision}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 italic">No specific decisions recorded</p>
          )}
        </Card>

        {/* Risks */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ApperIcon name="AlertTriangle" size={20} className="text-warning" />
            <h3 className="text-lg font-semibold text-white">Identified Risks</h3>
          </div>
          {summary.risks && summary.risks.length > 0 ? (
            <div className="space-y-3">
              {summary.risks.map((risk, index) => (
                <div key={index} className="flex items-start gap-3 p-3 glass rounded-lg border-l-2 border-l-warning">
                  <div className="w-6 h-6 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ApperIcon name="AlertTriangle" size={12} className="text-warning" />
                  </div>
                  <p className="text-white/90 leading-relaxed">{risk}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 italic">No risks identified</p>
          )}
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ApperIcon name="ListTodo" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-white">Action Items</h3>
          </div>
          <span className="text-sm text-white/60">
            {summary.actionItems?.length || 0} tasks assigned
          </span>
        </div>
        
        {summary.actionItems && summary.actionItems.length > 0 ? (
          <div className="grid gap-4">
            {summary.actionItems.map((item, index) => (
              <ActionItemCard key={index} item={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <ApperIcon name="Inbox" size={32} className="mx-auto mb-2 text-white/40" />
            <p>No action items identified</p>
          </div>
        )}
      </Card>

      {/* Key Insights */}
      {summary.keyInsights && summary.keyInsights.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ApperIcon name="Lightbulb" size={20} className="text-accent" />
            <h3 className="text-lg font-semibold text-white">Key Insights</h3>
          </div>
          <div className="grid gap-3">
            {summary.keyInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 glass rounded-lg">
                <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <ApperIcon name="Lightbulb" size={12} className="text-accent" />
                </div>
                <p className="text-white/90 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MeetingSummary;