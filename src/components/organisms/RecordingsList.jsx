import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { recordingsService } from "@/services/api/recordingsService";
import { cn } from "@/utils/cn";

const RecordingsList = () => {
  const [recordings, setRecordings] = useState([]);
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const navigate = useNavigate();

  useEffect(() => {
    loadRecordings();
  }, []);

  useEffect(() => {
    const sorted = [...recordings].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    setFilteredRecordings(sorted);
  }, [recordings, sortBy, sortOrder]);

  const loadRecordings = async () => {
    try {
      setError("");
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = await recordingsService.getAll();
      setRecordings(data);
    } catch (err) {
      setError("Failed to load recordings. Please try again.");
      console.error("Error loading recordings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredRecordings(recordings);
      return;
    }
    
    const filtered = recordings.filter(recording =>
      recording.title.toLowerCase().includes(query.toLowerCase()) ||
      recording.participants.some(p => p.toLowerCase().includes(query.toLowerCase())) ||
      recording.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
      recording.department.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRecordings(filtered);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recording?")) return;
    
    try {
      await recordingsService.delete(id);
      setRecordings(prev => prev.filter(r => r.Id !== id));
      toast.success("Recording deleted successfully");
    } catch (err) {
      toast.error("Failed to delete recording");
      console.error("Error deleting recording:", err);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return "ArrowUpDown";
    return sortOrder === "asc" ? "ArrowUp" : "ArrowDown";
  };

  const getImportanceColor = (importance) => {
    if (importance >= 8) return "text-error";
    if (importance >= 6) return "text-warning";
    if (importance >= 4) return "text-accent";
    return "text-success";
  };

  if (loading) return <Loading type="table" message="Loading your recordings..." />;
  if (error) return <Error message={error} onRetry={loadRecordings} />;
  
  if (recordings.length === 0) {
    return (
      <Empty
        title="No recordings yet"
        message="Start by creating your first audio recording. Transform your meetings into actionable insights with AI-powered analysis."
        icon="Mic"
        actionLabel="Start Recording"
        onAction={() => navigate("/record")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Audio Recordings</h1>
          <p className="text-white/70">Manage and analyze your audio content with AI insights</p>
        </div>
        <Button
          onClick={() => navigate("/record")}
          variant="default"
          size="lg"
          icon="Plus"
        >
          New Recording
        </Button>
      </div>

      <SearchBar
        onSearch={handleSearch}
        placeholder="Search recordings, participants, tags..."
        className="max-w-md"
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center gap-2 font-semibold text-white hover:text-primary transition-colors"
                  >
                    Title
                    <ApperIcon name={getSortIcon("title")} size={14} />
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center gap-2 font-semibold text-white hover:text-primary transition-colors"
                  >
                    Date
                    <ApperIcon name={getSortIcon("createdAt")} size={14} />
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort("duration")}
                    className="flex items-center gap-2 font-semibold text-white hover:text-primary transition-colors"
                  >
                    Duration
                    <ApperIcon name={getSortIcon("duration")} size={14} />
                  </button>
                </th>
                <th className="text-left p-4">Participants</th>
                <th className="text-left p-4">Tags</th>
                <th className="text-center p-4">Priority</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecordings.map((recording) => (
                <tr
                  key={recording.Id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                        <ApperIcon name="FileAudio" size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{recording.title}</div>
                        <div className="text-sm text-white/60">{recording.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-mono text-sm">
                      {format(new Date(recording.createdAt), "MMM dd, yyyy")}
                    </div>
                    <div className="text-xs text-white/60">
                      {format(new Date(recording.createdAt), "HH:mm")}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-mono">
                      {formatDuration(recording.duration)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {recording.participants.slice(0, 2).map((participant, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 glass rounded-full text-xs text-white/80"
                        >
                          {participant}
                        </span>
                      ))}
                      {recording.participants.length > 2 && (
                        <span className="px-2 py-1 glass rounded-full text-xs text-white/60">
                          +{recording.participants.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {recording.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {recording.tags.length > 2 && (
                        <span className="px-2 py-1 glass rounded-full text-xs text-white/60">
                          +{recording.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                      "glass border",
                      getImportanceColor(recording.importance || 5)
                    )}>
                      <ApperIcon name="TrendingUp" size={12} />
                      {recording.importance || 5}/10
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => navigate(`/recordings/${recording.Id}`)}
                        variant="ghost"
                        size="sm"
                        icon="Eye"
                      />
                      <Button
                        onClick={() => navigate(`/recordings/${recording.Id}/play`)}
                        variant="ghost"
                        size="sm"
                        icon="Play"
                      />
                      <Button
                        onClick={() => handleDelete(recording.Id)}
                        variant="ghost"
                        size="sm"
                        icon="Trash2"
                        className="text-error hover:bg-error/20"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-center text-sm text-white/60">
        Showing {filteredRecordings.length} of {recordings.length} recordings
      </div>
    </div>
  );
};

export default RecordingsList;