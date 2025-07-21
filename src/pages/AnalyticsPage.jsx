import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { recordingsService } from "@/services/api/recordingsService";
import { summariesService } from "@/services/api/summariesService";

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setError("");
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const [recordingsData, summariesData] = await Promise.all([
        recordingsService.getAll(),
        summariesService.getAll()
      ]);
      
      setRecordings(recordingsData);
      setSummaries(summariesData);
      calculateAnalytics(recordingsData, summariesData);
    } catch (err) {
      setError("Failed to load analytics data. Please try again.");
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (recordingsData, summariesData) => {
    // Basic metrics
    const totalRecordings = recordingsData.length;
    const totalDuration = recordingsData.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = totalRecordings > 0 ? totalDuration / totalRecordings : 0;
    
    // Department breakdown
    const departmentStats = recordingsData.reduce((acc, recording) => {
      acc[recording.department] = (acc[recording.department] || 0) + 1;
      return acc;
    }, {});

    // Meeting types from summaries
    const meetingTypes = summariesData.reduce((acc, summary) => {
      const type = summary.meetingType || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Priority distribution
    const priorityStats = summariesData.reduce((acc, summary) => {
      const importance = summary.importance || 5;
      if (importance >= 8) acc.high += 1;
      else if (importance >= 6) acc.medium += 1;
      else acc.low += 1;
      return acc;
    }, { high: 0, medium: 0, low: 0 });

    // Action items stats
    const totalActionItems = summariesData.reduce((sum, summary) => 
      sum + (summary.actionItems?.length || 0), 0
    );
    const pendingActions = summariesData.reduce((sum, summary) => 
      sum + (summary.actionItems?.filter(item => item.status === "pending").length || 0), 0
    );
    const completedActions = summariesData.reduce((sum, summary) => 
      sum + (summary.actionItems?.filter(item => item.status === "completed").length || 0), 0
    );

    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentRecordings = recordingsData.filter(r => 
      new Date(r.createdAt) >= weekAgo
    ).length;

    setAnalytics({
      totalRecordings,
      totalDuration,
      avgDuration,
      departmentStats,
      meetingTypes,
      priorityStats,
      totalActionItems,
      pendingActions,
      completedActions,
      recentRecordings,
      completionRate: totalActionItems > 0 ? (completedActions / totalActionItems * 100) : 0
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const StatCard = ({ title, value, subtitle, icon, color = "primary", trend }) => (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-12 h-12 bg-gradient-to-br from-${color}/20 to-${color}/30 rounded-xl flex items-center justify-center`}>
          <ApperIcon name={icon} size={24} className={`text-${color}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
          }`}>
            <ApperIcon name={trend > 0 ? "TrendingUp" : "TrendingDown"} size={12} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/70">{title}</div>
      {subtitle && <div className="text-xs text-white/50 mt-1">{subtitle}</div>}
    </Card>
  );

  const ChartCard = ({ title, data, icon }) => (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <ApperIcon name={icon} size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => {
          const total = Object.values(data).reduce((sum, v) => sum + v, 0);
          const percentage = total > 0 ? (value / total * 100) : 0;
          
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white capitalize mb-1">{key}</div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-sm text-white/70 ml-4 font-mono">
                {value} ({Math.round(percentage)}%)
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );

  if (loading) return <Loading message="Loading analytics data..." />;
  if (error) return <Error message={error} onRetry={loadAnalyticsData} />;
  
  if (!analytics || analytics.totalRecordings === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-white/70">Insights and metrics from your audio recordings</p>
        </div>
        <Empty
          title="No analytics data available"
          message="Start recording meetings to see analytics and insights about your audio content."
          icon="BarChart3"
          actionLabel="View Recordings"
          onAction={() => navigate("/")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-white/70">Insights and metrics from your audio recordings</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Recordings"
          value={analytics.totalRecordings}
          icon="FileAudio"
          color="primary"
          trend={12}
        />
        <StatCard
          title="Total Duration"
          value={formatDuration(analytics.totalDuration)}
          subtitle="Across all recordings"
          icon="Clock"
          color="secondary"
        />
        <StatCard
          title="Action Items"
          value={analytics.totalActionItems}
          subtitle={`${analytics.pendingActions} pending`}
          icon="ListTodo"
          color="accent"
        />
        <StatCard
          title="Completion Rate"
          value={`${Math.round(analytics.completionRate)}%`}
          subtitle="Tasks completed"
          icon="CheckCircle2"
          color="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Recordings by Department"
          data={analytics.departmentStats}
          icon="Building2"
        />
        <ChartCard
          title="Meeting Types"
          data={analytics.meetingTypes}
          icon="Users"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ApperIcon name="TrendingUp" size={20} className="text-warning" />
            <h3 className="text-lg font-semibold text-white">Priority Distribution</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-error rounded-full"></div>
                <span className="text-white">High Priority</span>
              </div>
              <span className="text-error font-semibold">{analytics.priorityStats.high}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-white">Medium Priority</span>
              </div>
              <span className="text-warning font-semibold">{analytics.priorityStats.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-white">Low Priority</span>
              </div>
              <span className="text-success font-semibold">{analytics.priorityStats.low}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ApperIcon name="Calendar" size={20} className="text-accent" />
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-3xl font-bold text-gradient mb-1">
                {analytics.recentRecordings}
              </div>
              <div className="text-sm text-white/70">New recordings this week</div>
            </div>
            <div className="pt-3 border-t border-white/10">
              <div className="text-lg font-semibold text-white">
                {formatDuration(analytics.avgDuration)}
              </div>
              <div className="text-sm text-white/70">Average recording length</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ApperIcon name="Target" size={20} className="text-success" />
            <h3 className="text-lg font-semibold text-white">Action Items Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Completed</span>
              <span className="text-success font-semibold">{analytics.completedActions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">In Progress</span>
              <span className="text-warning font-semibold">
                {analytics.totalActionItems - analytics.completedActions - analytics.pendingActions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Pending</span>
              <span className="text-white/70 font-semibold">{analytics.pendingActions}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Summary Cards */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <ApperIcon name="Brain" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-white">AI Insights Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 glass rounded-lg">
            <div className="text-2xl font-bold text-gradient mb-2">
              {Math.round(analytics.totalDuration / analytics.totalRecordings / 60)} min
            </div>
            <div className="text-sm text-white/70">Average Meeting Length</div>
          </div>
          <div className="text-center p-4 glass rounded-lg">
            <div className="text-2xl font-bold text-gradient mb-2">
              {(analytics.totalActionItems / analytics.totalRecordings).toFixed(1)}
            </div>
            <div className="text-sm text-white/70">Action Items per Meeting</div>
          </div>
          <div className="text-center p-4 glass rounded-lg">
            <div className="text-2xl font-bold text-gradient mb-2">
              {Object.keys(analytics.departmentStats).length}
            </div>
            <div className="text-sm text-white/70">Active Departments</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;