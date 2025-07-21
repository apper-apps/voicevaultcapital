import { useState, useEffect, useRef } from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const RecordingControls = ({ onRecordingComplete, maxDuration = 5400 }) => { // 90 minutes
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  const intervalRef = useRef();
  const mediaRecorderRef = useRef();
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (duration >= maxDuration) {
      handleStop();
    }
  }, [duration, maxDuration]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      chunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        onRecordingComplete?.({ blob, url, duration });
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      // Mock volume visualization
      const volumeInterval = setInterval(() => {
        setVolume(Math.random() * 100);
      }, 100);
      
      // Cleanup volume interval when recording stops
      setTimeout(() => clearInterval(volumeInterval), 1000);
      
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(intervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setVolume(0);
    clearInterval(intervalRef.current);
  };

  const getStatusText = () => {
    if (!isRecording) return "Ready to record";
    if (isPaused) return "Recording paused";
    return "Recording in progress...";
  };

  const getStatusColor = () => {
    if (!isRecording) return "text-white/60";
    if (isPaused) return "text-warning";
    return "text-success";
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-3 h-3 rounded-full",
            isRecording && !isPaused ? "bg-error animate-pulse-soft" : "bg-white/20"
          )} />
          <span className={cn("text-sm font-medium", getStatusColor())}>
            {getStatusText()}
          </span>
        </div>
        <div className="text-2xl font-mono font-bold text-white">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Volume Indicator */}
      {isRecording && !isPaused && (
        <div className="mb-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-success to-accent transition-all duration-100"
              style={{ width: `${volume}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            variant="success"
            size="lg"
            icon="Mic"
            className="px-8"
          >
            Start Recording
          </Button>
        ) : (
          <>
            {!isPaused ? (
              <Button
                onClick={pauseRecording}
                variant="secondary"
                size="lg"
                icon="Pause"
              >
                Pause
              </Button>
            ) : (
              <Button
                onClick={resumeRecording}
                variant="success"
                size="lg"
                icon="Play"
              >
                Resume
              </Button>
            )}
            <Button
              onClick={handleStop}
              variant="danger"
              size="lg"
              icon="Square"
            >
              Stop
            </Button>
          </>
        )}
      </div>

      {duration > 0 && (
        <div className="mt-4 text-center text-xs text-white/60">
          Maximum duration: {Math.floor(maxDuration / 60)} minutes • Remaining: {formatDuration(maxDuration - duration)}
        </div>
      )}
    </div>
  );
};

export default RecordingControls;