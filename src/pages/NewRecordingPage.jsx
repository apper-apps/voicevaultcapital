import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import RecordingControls from "@/components/molecules/RecordingControls";
import ApperIcon from "@/components/ApperIcon";
import { recordingsService } from "@/services/api/recordingsService";

const NewRecordingPage = () => {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(null);
  const [metadata, setMetadata] = useState({
    title: "",
    participants: "",
    tags: "",
    department: ""
  });
  const [saving, setSaving] = useState(false);

  const handleRecordingComplete = (recordingData) => {
    setRecording(recordingData);
    toast.success("Recording completed successfully!");
  };

  const handleSave = async () => {
    if (!recording) {
      toast.error("No recording to save");
      return;
    }

    if (!metadata.title.trim()) {
      toast.error("Please provide a title for the recording");
      return;
    }

    setSaving(true);

    try {
      const participantsList = metadata.participants
        .split(",")
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const tagsList = metadata.tags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const recordingPayload = {
        title: metadata.title,
        audioUrl: recording.url,
        duration: recording.duration,
        participants: participantsList,
        tags: tagsList,
        department: metadata.department || "General",
        transcriptId: null,
        summaryId: null
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      const savedRecording = await recordingsService.create(recordingPayload);
      
      toast.success("Recording saved successfully!");
      navigate(`/recordings/${savedRecording.Id}`);
    } catch (error) {
      toast.error("Failed to save recording. Please try again.");
      console.error("Error saving recording:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (recording && window.confirm("Are you sure you want to discard this recording?")) {
      setRecording(null);
      setMetadata({
        title: "",
        participants: "",
        tags: "",
        department: ""
      });
      toast.info("Recording discarded");
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">New Recording</h1>
          <p className="text-white/70">Record and analyze your meeting with AI-powered insights</p>
        </div>
      </div>

      {/* Recording Controls */}
      <RecordingControls onRecordingComplete={handleRecordingComplete} />

      {/* Recording Metadata Form */}
      {recording && (
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <ApperIcon name="FileText" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-white">Recording Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Title *
              </label>
              <Input
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title for this recording"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Participants
                </label>
                <Input
                  value={metadata.participants}
                  onChange={(e) => setMetadata(prev => ({ ...prev, participants: e.target.value }))}
                  placeholder="John Doe, Jane Smith, ..."
                />
                <p className="text-xs text-white/60 mt-1">Separate names with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Department
                </label>
                <Input
                  value={metadata.department}
                  onChange={(e) => setMetadata(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Engineering, Sales, Marketing, ..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tags
              </label>
              <Input
                value={metadata.tags}
                onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="meeting, strategy, planning, ..."
              />
              <p className="text-xs text-white/60 mt-1">Separate tags with commas</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10">
            <Button
              onClick={handleSave}
              variant="default"
              loading={saving}
              icon="Save"
              size="lg"
            >
              Save Recording
            </Button>
            <Button
              onClick={handleDiscard}
              variant="secondary"
              icon="Trash2"
              size="lg"
            >
              Discard
            </Button>
          </div>
        </Card>
      )}

      {/* Instructions */}
      {!recording && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ApperIcon name="Info" size={20} className="text-accent" />
            <h3 className="text-lg font-semibold text-white">Getting Started</h3>
          </div>
          <div className="space-y-3 text-white/80">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-medium">Start Recording</p>
                <p className="text-sm text-white/60">Click the record button to begin capturing audio</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-secondary text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Pause & Resume</p>
                <p className="text-sm text-white/60">Use pause/resume controls during breaks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-accent text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Add Details</p>
                <p className="text-sm text-white/60">Provide title, participants, and tags after recording</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-success text-sm font-bold">4</span>
              </div>
              <div>
                <p className="font-medium">AI Analysis</p>
                <p className="text-sm text-white/60">Get automatic transcription and meeting insights</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NewRecordingPage;