import React, { useEffect, useRef, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const RecordingControls = ({ 
  onRecordingComplete, 
  onError,
  maxDuration = 5400, 
  nightMode = false,
  minimized = false 
}) => { // 90 minutes
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
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext && location.hostname !== 'localhost') {
        throw new Error("HTTPS_REQUIRED", { 
          cause: "Recording requires a secure connection (HTTPS) for security reasons." 
        });
      }

      // Check if MediaRecorder is supported
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        throw new Error("BROWSER_NOT_SUPPORTED", { 
          cause: "Your browser doesn't support audio recording. Please use Chrome, Firefox, or Safari." 
        });
      }

      // Check microphone permission status first
      let permissionStatus;
      try {
        permissionStatus = await navigator.permissions.query({ name: 'microphone' });
      } catch (permError) {
        // Fallback for browsers that don't support permissions API
        console.warn("Permissions API not available:", permError);
      }

      if (permissionStatus?.state === 'denied') {
        throw new Error("PERMISSION_DENIED", { 
          cause: "Microphone access has been permanently denied. Please reset permissions in your browser settings." 
        });
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      chunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
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

      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        onError?.({ 
          message: "Recording Error",
          details: "An error occurred during recording. Please try again."
        });
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
      console.error("Recording error:", error);
      
      let errorMessage = "Recording Error";
      let errorDetails = "";

      // Handle specific error types
      switch (error.name || error.message) {
        case "NotAllowedError":
        case "PERMISSION_DENIED":
          errorMessage = "Microphone Permission Required";
          errorDetails = `To start recording, please:
1. Click the microphone icon in your browser's address bar
2. Select "Allow" for microphone access
3. Refresh the page and try again

If you previously denied access, you may need to:
• Click the lock/shield icon next to the address bar
• Change microphone permission to "Allow"
• Reload the page`;
          break;
          
        case "NotFoundError":
          errorMessage = "No Microphone Found";
          errorDetails = `No microphone was detected:
• Make sure your microphone is connected
• Check if other applications are using it
• Try refreshing the page`;
          break;
          
        case "NotReadableError":
          errorMessage = "Microphone Access Blocked";
          errorDetails = `Your microphone is being used by another application:
• Close other apps that might be using the microphone
• Try disconnecting and reconnecting your microphone
• Restart your browser`;
          break;
          
        case "HTTPS_REQUIRED":
          errorMessage = "Secure Connection Required";
          errorDetails = error.cause || "Recording requires HTTPS for security reasons.";
          break;
          
        case "BROWSER_NOT_SUPPORTED":
          errorMessage = "Browser Not Supported";
          errorDetails = error.cause || "Please use a modern browser that supports audio recording.";
          break;
          
        case "OverconstrainedError":
          errorMessage = "Audio Settings Not Supported";
          errorDetails = `Your audio device doesn't support the required settings:
• Try using a different microphone
• Check your audio drivers are up to date`;
          break;
          
        default:
          errorMessage = "Recording Failed";
          errorDetails = `An unexpected error occurred: ${error.message}
Please try:
• Refreshing the page
• Checking your microphone connection
• Using a different browser`;
      }

      onError?.({ message: errorMessage, details: errorDetails });
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

if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 glass-card rounded-lg p-3 z-50">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isRecording && !isPaused ? "bg-error animate-pulse-soft" : "bg-white/20"
          )} />
          <span className="text-xs font-mono text-white">
            {formatDuration(duration)}
          </span>
          {nightMode && <span className="text-xs">🌙</span>}
        </div>
      </div>
    );
  }

  return (
    <div
    className={cn(
        "glass-card rounded-xl",
        nightMode ? "p-4 bg-slate-900/50 border-slate-700/50" : "p-6"
    )}>
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            <div
                className={cn(
                    "w-3 h-3 rounded-full",
                    isRecording && !isPaused ? "bg-error animate-pulse-soft" : "bg-white/20"
                )} />
<span className={cn("text-sm font-medium", getStatusColor())}>
                {nightMode ? `Night Recording ${getStatusText()}` : getStatusText()}
            </span>
            {nightMode && <span className="text-lg">🌙</span>}
        </div>
        <div
            className={cn("font-mono font-bold text-white", nightMode ? "text-lg" : "text-2xl")}>
            {formatDuration(duration)}
        </div>
    </div>
    {/* Volume Indicator */}
    {isRecording && !isPaused && <div className="mb-4">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-success to-accent transition-all duration-100"
                style={{
                    width: `${volume}%`
                }} />
        </div>
    </div>}
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