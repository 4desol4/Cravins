import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const VideoPlayer = ({ video, onVideoEnd, className = "" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Critical: videoKey forces complete remount when URL changes
  const [videoKey, setVideoKey] = useState(Date.now());

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const previousUrlRef = useRef(null);

  // CRITICAL FIX: Force complete remount when video URL changes
  useEffect(() => {
    // Check if URL has actually changed
    if (video?.url && video.url !== previousUrlRef.current) {
      console.log(
        "Video URL changed from:",
        previousUrlRef.current,
        "to:",
        video.url
      );

      // Update key to force remount
      setVideoKey(Date.now());

      // Reset all states
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      // Store new URL
      previousUrlRef.current = video.url;
    }
  }, [video?.url]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onVideoEnd?.();
    };

    const handleError = (e) => {
      console.error("Video error:", e);
      setIsPlaying(false);
    };

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("error", handleError);

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("ended", handleEnded);
      videoElement.removeEventListener("error", handleError);
    };
  }, [onVideoEnd, videoKey]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play().catch((err) => console.error("Play error:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const videoElement = videoRef.current;
    if (!videoElement || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;

    videoElement.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVolume) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    videoElement.volume = clampedVolume;
    setIsMuted(clampedVolume === 0);
  };

  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isMuted) {
      videoElement.volume = volume > 0 ? volume : 0.5;
      setIsMuted(false);
    } else {
      videoElement.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  const isYouTubeVideo =
    video?.url?.includes("youtube.com/embed/") ||
    video?.url?.includes("youtu.be");

  let embedUrl = video.url;
  if (!embedUrl.includes("embed") && isYouTubeVideo) {
    const idMatch = video.url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (idMatch?.[1]) {
      embedUrl = `https://www.youtube.com/embed/${idMatch[1]}`;
    }
  }

  return isYouTubeVideo ? (
    <div
      key={`youtube-${videoKey}`}
      className={`relative bg-black rounded-xl overflow-hidden shadow-2xl ${className}`}
    >
      <iframe
        key={videoKey}
        src={`${embedUrl}?autoplay=0&rel=0&modestbranding=1`}
        title={video.title}
        className="w-full aspect-video"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  ) : (
    <div
      key={`video-${videoKey}`}
      ref={containerRef}
      className={`relative bg-black rounded-xl overflow-hidden group shadow-2xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        key={videoKey}
        ref={videoRef}
        src={video.url}
        poster={video.thumbnail}
        className="w-full aspect-video cursor-pointer"
        onClick={togglePlay}
        playsInline
        controls
      />

      {/* Play/Pause Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="w-20 h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white pointer-events-auto hover:bg-black/60 transition-colors"
        >
          {isPlaying ? (
            <PauseIcon className="w-10 h-10" />
          ) : (
            <PlayIcon className="w-10 h-10 ml-1" />
          )}
        </motion.button>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4"
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <div
            className="w-full h-2 bg-white/20 rounded-full cursor-pointer hover:h-3 transition-all"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-150 relative"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary-400 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-primary-400 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <SpeakerXMarkIcon className="w-6 h-6" />
                ) : (
                  <SpeakerWaveIcon className="w-6 h-6" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            <div className="text-white text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="text-white hover:text-primary-400 transition-colors">
              <Cog6ToothIcon className="w-6 h-6" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-primary-400 transition-colors"
            >
              <ArrowsPointingOutIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.div>

      {!duration && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
