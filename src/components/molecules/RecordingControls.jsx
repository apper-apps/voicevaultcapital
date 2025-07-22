import React, { useEffect, useRef, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import ErrorComponent from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const RecordingControls = ({ onRecordingComplete, onError, maxDuration = 3600 }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState('unknown') // 'granted', 'denied', 'prompt', 'unknown'
  const [browserSupported, setBrowserSupported] = useState(true)
  
  // Refs for recording
  const mediaRecorderRef = useRef()
  const chunksRef = useRef([])
  const intervalRef = useRef();

  // Check browser compatibility and permissions on mount
  useEffect(() => {
    checkBrowserSupport()
    checkPermissionStatus()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop recording if active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const checkBrowserSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setBrowserSupported(false)
      setError({
        message: "Browser Not Supported",
        details: `Your browser doesn't support audio recording. Please use:
• Chrome 47+ or Firefox 29+
• Safari 11+ or Edge 12+
• Make sure you're using HTTPS (required for microphone access)`
      })
      return false
    }
    
    if (!window.MediaRecorder) {
      setBrowserSupported(false)
      setError({
        message: "MediaRecorder Not Supported",
        details: `Your browser doesn't support the MediaRecorder API. Please try:
• Updating your browser to the latest version
• Using Chrome, Firefox, Safari, or Edge
• Ensuring you're on a secure (HTTPS) connection`
      })
      return false
    }
    
    return true
  }

  const checkPermissionStatus = async () => {
    if (!navigator.permissions) {
      setPermissionStatus('unknown')
      return
    }

    try {
      const result = await navigator.permissions.query({ name: 'microphone' })
      setPermissionStatus(result.state)
      
      result.onchange = () => {
        setPermissionStatus(result.state)
        if (result.state === 'denied' && isRecording) {
          handleRecordingError(new Error('PERMISSION_DENIED'))
        }
      }
    } catch (error) {
      console.warn('Could not check microphone permission:', error)
      setPermissionStatus('unknown')
    }
  }

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop()) // Stop the test stream
      setPermissionStatus('granted')
      setError(null)
      return true
    } catch (error) {
      setPermissionStatus('denied')
      handleRecordingError(error)
      return false
    }
  }

  const handleRecordingError = (error) => {
    console.error("Recording error:", error);
    
    let errorMessage = "Recording Error";
    let errorDetails = "";

    // Handle specific error types
    switch (error.name || error.message) {
      case "NotAllowedError":
      case "PERMISSION_DENIED":
        setPermissionStatus('denied')
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

    const errorObj = { message: errorMessage, details: errorDetails };
    setError(errorObj);
    onError?.(errorObj);
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Start recording function
  const startRecording = async () => {
    if (!browserSupported) {
      return
    }

    // Check permission first
    if (permissionStatus === 'denied') {
      handleRecordingError(new Error('PERMISSION_DENIED'))
      return
    }

    if (permissionStatus !== 'granted') {
      const hasPermission = await requestPermission()
      if (!hasPermission) return
    }
setError(null)
    setIsProcessing(true)

    try {
      // Check HTTPS requirement
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('HTTPS_REQUIRED')
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      // Set up event handlers
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
        
        onRecordingComplete?.({
          blob,
          url,
          duration,
          mimeType
        })
        
        // Reset states
        setIsRecording(false)
        setIsPaused(false)
        setDuration(0)
        setVolume(0)
        setIsProcessing(false)
      }

      // Error handler
      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        handleRecordingError(event.error || new Error("Recording failed"));
      };

      // Start recording
      mediaRecorderRef.current.start(1000) // Record in 1-second chunks
      setIsRecording(true)
      setIsProcessing(false)

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)

      // Simple volume indicator (simulated)
      const volumeInterval = setInterval(() => {
        setVolume(Math.random() * 100);
      }, 100);
      
      // Cleanup volume interval when recording stops
      setTimeout(() => clearInterval(volumeInterval), 1000);

    } catch (error) {
      setIsProcessing(false)
      handleRecordingError(error)
    }
};

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      clearInterval(intervalRef.current)
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      
      // Resume duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    }
  }

  const handleStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsProcessing(true)
    }
    clearInterval(intervalRef.current);
  }

  const getStatusText = () => {
    if (isProcessing) return "Processing..."
    if (isRecording && isPaused) return "Paused"
    if (isRecording) return "Recording"
    if (permissionStatus === 'denied') return "Permission Required"
    if (permissionStatus === 'prompt') return "Permission Needed"
    if (!browserSupported) return "Not Supported"
    return "Ready"
  }

  const getStatusColor = () => {
    if (isProcessing) return "text-accent"
    if (isRecording && isPaused) return "text-warning"
    if (isRecording) return "text-error animate-pulse"
    if (permissionStatus === 'denied' || !browserSupported) return "text-error"
    if (permissionStatus === 'prompt') return "text-warning"
    return "text-white/60"
  }

  const getPermissionIcon = () => {
    switch (permissionStatus) {
      case 'granted': return 'CheckCircle'
      case 'denied': return 'XCircle'
      case 'prompt': return 'AlertCircle'
      default: return 'HelpCircle'
    }
  }

  if (error) {
    return (
      <ErrorComponent 
        message={error.message} 
        onRetry={() => setError(null)} 
        showRetry 
      />
    )
  }

  return (
    <div className="space-y-6">
    {/* Permission Status Banner */}
    {(permissionStatus === "denied" || permissionStatus === "prompt" || !browserSupported) && <div
        className={cn(
            "glass-card rounded-xl p-4 border-l-4",
            permissionStatus === "denied" || !browserSupported ? "border-l-error" : "border-l-warning"
        )}>
        <div className="flex items-center gap-3">
            <ApperIcon
                name={getPermissionIcon()}
                size={20}
                className={cn(
                    permissionStatus === "denied" || !browserSupported ? "text-error" : "text-warning"
                )} />
            <div className="flex-1">
                <div className="font-medium text-white">
                    {!browserSupported ? "Browser Not Supported" : permissionStatus === "denied" ? "Microphone Access Denied" : "Microphone Permission Required"}
                </div>
                <div className="text-sm text-white/70 mt-1">
                    {!browserSupported ? "Please use a modern browser" : permissionStatus === "denied" ? "Click the microphone icon in your address bar to allow access" : "Click below to grant microphone permission"}
                </div>
            </div>
            {permissionStatus === "prompt" && <Button onClick={requestPermission} variant="secondary" size="sm" icon="Mic">Grant Permission
                              </Button>}
        </div>
    </div>}
    {/* Main Controls Card */}
    <div className="glass-card rounded-2xl p-8">
        <div className="flex flex-col items-center space-y-6">
            {/* Status */}
            <div className="text-center">
                <div className={cn("text-lg font-medium", getStatusColor())}>
                    {getStatusText()}
                </div>
                <div className="text-3xl font-mono font-bold text-white mt-1">
                    {formatDuration(duration)}
                </div>
                {maxDuration && <div className="text-sm text-white/50 mt-1">Max: {formatDuration(maxDuration)}
                </div>}
            </div>
            {/* Volume Visualization */}
            {isRecording && <div className="flex items-center space-x-2">
                <ApperIcon name="Mic" size={16} className="text-primary" />
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-75"
                        style={{
                            width: `${Math.min(volume, 100)}%`
                        }} />
                </div>
                <span className="text-xs text-white/50 w-8">{Math.round(volume)}%</span>
            </div>}
            {/* Control Buttons */}
            <div className="flex items-center gap-4">
                {!isRecording ? <Button
                    onClick={startRecording}
                    variant="default"
                    size="xl"
                    icon="Mic"
                    loading={isProcessing}
                    disabled={permissionStatus === "denied" || !browserSupported}
                    className="px-8 py-4">Start Recording
                                  </Button> : <>
                    {!isPaused ? <Button onClick={pauseRecording} variant="secondary" size="lg" icon="Pause">Pause
                                          </Button> : <Button onClick={resumeRecording} variant="default" size="lg" icon="Play">Resume
                                          </Button>}
                    <Button
                        onClick={handleStop}
                        variant="secondary"
                        size="lg"
                        size="lg"
                        icon="Square">Stop
                                    </Button>
                </>}
            </div>
            {duration > 0 && <div className="mt-4 text-center text-xs text-white/60">Maximum duration: {Math.floor(maxDuration / 60)}minutes • Remaining: {formatDuration(maxDuration - duration)}
            </div>}
        </div></div></div>
  );
};

export default RecordingControls;