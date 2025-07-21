import { useState, useRef, useEffect } from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const AudioPlayer = ({ audioUrl, duration = 0, onTimeUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
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

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
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

  return (
    <div className="glass-card rounded-xl p-6">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex items-center gap-4 mb-4">
        <Button
          onClick={togglePlayPause}
          variant="default"
          size="lg"
          icon={isPlaying ? "Pause" : "Play"}
          className="rounded-full w-12 h-12 p-0"
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
          />
        </div>
        
        <div className="flex items-center gap-1">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
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