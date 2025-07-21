import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "./Sidebar";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { recordingsService } from "@/services/api/recordingsService";
import { cn } from "@/utils/cn";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNightRecording, setIsNightRecording] = useState(false);
  const [nightRecordingDuration, setNightRecordingDuration] = useState(0);
  const [nightRecordingSettings, setNightRecordingSettings] = useLocalStorage('night_recording_settings', {
    enabled: false,
    maxDuration: 28800, // 8 hours
    autoSave: true,
    startedAt: null
  });

  useEffect(() => {
    let interval;
    if (isNightRecording) {
      interval = setInterval(() => {
        setNightRecordingDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= nightRecordingSettings.maxDuration) {
            handleStopNightRecording();
            return prev;
          }
          return newDuration;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isNightRecording, nightRecordingSettings.maxDuration]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartNightRecording = async () => {
    try {
      if (isNightRecording) {
        handleStopNightRecording();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      setIsNightRecording(true);
      setNightRecordingDuration(0);
      setNightRecordingSettings(prev => ({
        ...prev,
        enabled: true,
        startedAt: new Date().toISOString()
      }));

      toast.success("Night recording started", {
        icon: "🌙"
      });

      // Store stream reference for cleanup
      window.nightRecordingStream = stream;
      
    } catch (error) {
      console.error("Error starting night recording:", error);
      toast.error("Failed to start night recording. Please check microphone permissions.");
    }
  };

  const handleStopNightRecording = async () => {
    try {
      if (window.nightRecordingStream) {
        window.nightRecordingStream.getTracks().forEach(track => track.stop());
        delete window.nightRecordingStream;
      }

      if (nightRecordingSettings.autoSave && nightRecordingDuration > 0) {
        const recordingData = {
          title: `Night Recording - ${new Date().toLocaleDateString()}`,
          duration: nightRecordingDuration,
          type: "night_recording",
          department: "Personal",
          participants: [],
          tags: ["night", "background"],
          audioUrl: `night_recording_${Date.now()}.webm`,
          transcriptId: null,
          summaryId: null
        };

        await recordingsService.create(recordingData);
        toast.success(`Night recording saved (${formatDuration(nightRecordingDuration)})`, {
          icon: "💾"
        });
      }

      setIsNightRecording(false);
      setNightRecordingDuration(0);
      setNightRecordingSettings(prev => ({
        ...prev,
        enabled: false,
        startedAt: null
      }));

      toast.info("Night recording stopped", {
        icon: "🛑"
      });
      
    } catch (error) {
      console.error("Error stopping night recording:", error);
      toast.error("Error stopping night recording");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/50">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden glass border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => setSidebarOpen(true)}
                variant="ghost"
                size="sm"
                icon="Menu"
              />
<div className="flex items-center gap-2">
                <button
                  onClick={handleStartNightRecording}
                  className={cn(
                    "w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95",
                    isNightRecording 
                      ? "from-error to-orange-500 animate-pulse-soft shadow-lg shadow-error/30" 
                      : "from-primary to-secondary hover:shadow-lg hover:shadow-primary/30"
                  )}
                  title={isNightRecording ? `Stop night recording (${formatDuration(nightRecordingDuration)})` : "Start night recording"}
                >
                  <ApperIcon 
                    name={isNightRecording ? "MicOff" : "Mic"} 
                    size={16} 
                    className="text-white" 
                  />
                </button>
                <button
                  onClick={handleStartNightRecording}
                  className="font-bold text-gradient hover:scale-105 transition-transform duration-200 cursor-pointer"
                  title={isNightRecording ? "Stop night recording" : "Start night recording"}
                >
                  VoiceVault AI
                  {isNightRecording && (
                    <span className="ml-2 text-xs text-error font-normal">
                      🌙 {formatDuration(nightRecordingDuration)}
                    </span>
                  )}
                </button>
              </div>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </div>

          {/* Main Content */}
          <main className="p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: "rgba(30, 41, 59, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      />
    </div>
  );
};

export default Layout;