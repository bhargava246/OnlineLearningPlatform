import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, SkipBack, SkipForward, Maximize } from "lucide-react";

interface VideoPlayerProps {
  title: string;
  duration: string;
  videoUrl?: string;
}

export default function VideoPlayer({ title, duration, videoUrl }: VideoPlayerProps) {
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="video-player-container">
        <div className="text-center text-white">
          <i className="fas fa-play-circle text-6xl mb-4 opacity-80"></i>
          <p className="text-lg">{title}</p>
          <p className="text-sm opacity-70">Duration: {duration}</p>
        </div>
      </div>

      {/* Video Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Play
          </Button>
          <Button variant="ghost">
            <SkipBack className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button variant="ghost">
            Next
            <SkipForward className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5x">0.5x</SelectItem>
              <SelectItem value="0.75x">0.75x</SelectItem>
              <SelectItem value="1x">1x</SelectItem>
              <SelectItem value="1.25x">1.25x</SelectItem>
              <SelectItem value="1.5x">1.5x</SelectItem>
              <SelectItem value="2x">2x</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
