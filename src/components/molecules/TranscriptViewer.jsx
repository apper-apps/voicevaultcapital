import { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const TranscriptViewer = ({ transcript, currentTime = 0, onSegmentClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSegments, setFilteredSegments] = useState([]);

  useEffect(() => {
    if (!transcript?.segments) {
      setFilteredSegments([]);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredSegments(transcript.segments);
      return;
    }

    const filtered = transcript.segments.filter(segment =>
      segment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      segment.speaker.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSegments(filtered);
  }, [transcript, searchQuery]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const isSegmentActive = (segment) => {
    return currentTime >= segment.startTime && currentTime <= segment.endTime;
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-accent/30 text-accent font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getSpeakerColor = (speaker) => {
    const colors = [
      "border-l-primary bg-primary/5",
      "border-l-secondary bg-secondary/5", 
      "border-l-accent bg-accent/5",
      "border-l-success bg-success/5",
      "border-l-warning bg-warning/5"
    ];
    const hash = speaker.split("").reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  if (!transcript) {
    return (
      <Card className="text-center py-12">
        <ApperIcon name="FileText" size={48} className="mx-auto text-white/40 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Transcript Available</h3>
        <p className="text-white/60">Start recording to see the transcript here</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <ApperIcon 
          name="Search" 
          size={20} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" 
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transcript..."
          className="w-full pl-10 pr-4 py-3 glass rounded-lg border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
        />
      </div>

      <Card hover={false} className="max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {filteredSegments.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              {searchQuery ? "No matching segments found" : "No transcript segments available"}
            </div>
          ) : (
            filteredSegments.map((segment, index) => (
              <div
                key={index}
                onClick={() => onSegmentClick?.(segment.startTime)}
                className={cn(
                  "p-4 rounded-lg border-l-4 transition-all duration-200 cursor-pointer",
                  getSpeakerColor(segment.speaker),
                  isSegmentActive(segment) 
                    ? "ring-2 ring-primary/50 bg-primary/10 scale-[1.02]" 
                    : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {segment.speaker}
                    </span>
                    <span className="text-xs px-2 py-1 glass rounded-full text-white/70">
                      Speaker {segment.speaker.match(/\d+/)?.[0] || "1"}
                    </span>
                  </div>
                  <span className="text-xs text-white/60 font-mono">
                    {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                  </span>
                </div>
                <p className="text-white/90 leading-relaxed">
                  {highlightText(segment.text, searchQuery)}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default TranscriptViewer;