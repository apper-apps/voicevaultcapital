import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import AudioPlayer from "@/components/molecules/AudioPlayer";
import TranscriptViewer from "@/components/molecules/TranscriptViewer";
import MeetingSummary from "@/components/organisms/MeetingSummary";
import ApperIcon from "@/components/ApperIcon";
import { recordingsService } from "@/services/api/recordingsService";
import { transcriptsService } from "@/services/api/transcriptsService";
import { summariesService } from "@/services/api/summariesService";
import { format } from "date-fns";

const RecordingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("transcript");
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    loadRecordingData();
  }, [id]);

  const loadRecordingData = async () => {
    try {
      setError("");
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const recordingData = await recordingsService.getById(id);
      setRecording(recordingData);

      // Load transcript
      try {
        const transcriptData = await transcriptsService.getByRecordingId(id);
        setTranscript(transcriptData);
      } catch (err) {
        console.log("No transcript found for recording");
      }

      // Load summary
      try {
        const summaryData = await summariesService.getByRecordingId(id);
        setSummary(summaryData);
      } catch (err) {
        console.log("No summary found for recording");
      }

    } catch (err) {
      setError("Failed to load recording details. Please try again.");
      console.error("Error loading recording data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSegmentClick = (time) => {
    setCurrentTime(time);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const tabs = [
    { id: "transcript", label: "Transcript", icon: "FileText" },
    { id: "summary", label: "AI Summary", icon: "Brain" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6">
          <Loading message="Loading recording details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Error message={error} onRetry={loadRecordingData} />
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="space-y-6">
        <Error message="Recording not found" showRetry={false} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          size="sm"
          icon="ArrowLeft"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">{recording.title}</h1>
          <div className="flex items-center gap-4 text-white/60">
            <div className="flex items-center gap-2">
              <ApperIcon name="Calendar" size={16} />
              <span>{format(new Date(recording.createdAt), "MMM dd, yyyy 'at' HH:mm")}</span>
            </div>
            <div className="flex items-center gap-2">
              <ApperIcon name="Clock" size={16} />
              <span>{formatDuration(recording.duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ApperIcon name="Building" size={16} />
              <span>{recording.department}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Participants and Tags */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Participants</h3>
            <div className="flex flex-wrap gap-2">
              {recording.participants.map((participant, index) => (
                <div key={index} className="flex items-center gap-2 glass rounded-lg px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <ApperIcon name="User" size={14} className="text-primary" />
                  </div>
                  <span className="text-white text-sm">{participant}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {recording.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

{/* Audio Player */}
      <AudioPlayer
        audioUrl={recording?.audioUrl}
        duration={recording?.duration || 0}
        onTimeUpdate={setCurrentTime}
      />

      {/* Content Tabs */}
      <Card>
        <div className="flex items-center gap-1 mb-6 bg-white/5 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <ApperIcon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === "transcript" && (
            <TranscriptViewer
              transcript={transcript}
              currentTime={currentTime}
              onSegmentClick={handleSegmentClick}
            />
          )}
          {activeTab === "summary" && <MeetingSummary summary={summary} />}
        </div>
      </Card>
    </div>
  );
};

export default RecordingDetailPage;