import { useState, useRef, useEffect } from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const AudioPlayer = ({ audioUrl, duration = 0, onTimeUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [audioLoading, setAudioLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef();
  const progressRef = useRef();

useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setAudioError(true);
      setAudioLoading(false);
      setIsPlaying(false);
    };

    const handleLoadedData = () => {
      setAudioError(false);
      setAudioLoading(false);
    };

    const handleLoadStart = () => {
      setAudioLoading(true);
      setAudioError(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("loadstart", handleLoadStart);
    };
  }, [onTimeUpdate]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

const togglePlayPause = async () => {
    if (audioError || !audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      setAudioError(true);
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * (duration || audioRef.current.duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    audioRef.current.playbackRate = speed;
  };

  const totalDuration = duration || (audioRef.current?.duration || 0);
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

// Don't render if no audio URL provided
  if (!audioUrl) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-4 text-white/60">
          <ApperIcon name="AlertCircle" size={20} className="text-warning" />
          <span>No audio file available for this recording</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {audioError && (
        <div className="flex items-center gap-4 mb-4 p-4 bg-error/10 border border-error/20 rounded-lg">
          <ApperIcon name="AlertCircle" size={20} className="text-error" />
          <div className="flex-1">
            <p className="text-error font-medium">Audio Error</p>
            <p className="text-white/60 text-sm">Unable to load the audio file. Please check if the file exists.</p>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-4">
        <Button
          onClick={togglePlayPause}
          variant="default"
          size="lg"
          icon={audioLoading ? "Loader2" : isPlaying ? "Pause" : "Play"}
          className={cn(
            "rounded-full w-12 h-12 p-0",
            (audioError || audioLoading) && "opacity-50 cursor-not-allowed"
          )}
          disabled={audioError || audioLoading}
        />
        
        <div className="flex-1">
          <div 
            ref={progressRef}
            className="h-2 bg-white/10 rounded-full cursor-pointer relative overflow-hidden"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
              style={{ left: `${progress}%`, marginLeft: "-8px" }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/60 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      </div>

<div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ApperIcon name="Volume2" size={16} className="text-white/60" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-primary"
            disabled={audioError}
          />
        </div>
        
<div className="flex items-center gap-1">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              disabled={audioError}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                audioError && "opacity-50 cursor-not-allowed",
                playbackRate === speed 
                  ? "bg-primary text-white" 
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;