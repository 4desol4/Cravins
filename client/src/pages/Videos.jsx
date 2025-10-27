import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircleIcon,
  PlusIcon,
  ArrowLeftIcon,
  EyeIcon,
  ClockIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import VideoPlayer from "../components/videos/VideoPlayer";
import VideoList from "../components/videos/VideoList";
import VideoUpload from "../components/videos/VideoUpload";
import Modal from "../components/common/Modal";
import { videoAPI } from "../services/api";
import toast from "react-hot-toast";

const Videos = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState("list");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [videoStats, setVideoStats] = useState({
    totalVideos: 0,
    totalViews: 0,
  });

  useEffect(() => {
    fetchVideoStats();
  }, []);

  useEffect(() => {
    if (selectedVideo && selectedVideo.subject) {
      fetchRelatedVideos();
    }
  }, [selectedVideo]);

  const fetchVideoStats = async () => {
    try {
      const response = await videoAPI.getVideos({ page: 1, limit: 1000 });
      const { data, pagination } = response.data.data;

      const videos = Array.isArray(data) ? data : [];
      const totalVideos = pagination?.total || videos.length;
      const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);

      setVideoStats({
        totalVideos,
        totalViews,
      });
    } catch (error) {
      console.error("Failed to fetch video stats:", error);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const params = {
        subject: selectedVideo.subject?.id,
        limit: 6,
        exclude: selectedVideo.id,
      };
      const response = await videoAPI.getVideos(params);
      setRelatedVideos(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch related videos:", error);
    }
  };

  const handleVideoSelect = async (video) => {
    try {
      const response = await videoAPI.getVideo(video.id);
      setSelectedVideo(response.data.data);
      setCurrentView("player");
    } catch (error) {
      toast.error("Failed to load video");
    }
  };

  const handleVideoEnd = () => {
    toast.success("Video completed! Check out related videos below.");
  };

  const handleVideoUpload = () => {
    setShowUploadModal(false);
    toast.success("Video uploaded successfully!");
    fetchVideoStats();
    if (currentView === "list") {
      window.location.reload();
    }
  };

  const renderHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          {currentView === "player" && (
            <button
              onClick={() => setCurrentView("list")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-charcoal-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-charcoal-800 hover:bg-gray-50 dark:hover:bg-charcoal-700 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              <span>Back to Videos</span>
            </button>
          )}

          <div>
            <h1 className="text-3xl lg:text-4xl font-heading text-gray-900 dark:text-white">
              {currentView === "player"
                ? selectedVideo?.title
                : "Video Lessons"}
            </h1>
            {currentView === "list" && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Learn from expert instructors with high-quality video content
              </p>
            )}
          </div>
        </div>

        {user?.role === "ADMIN" && currentView === "list" && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            <span>Add Video</span>
          </button>
        )}
      </div>

      {currentView === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-charcoal-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-charcoal-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-2">
                  <PlayCircleIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Total Videos</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {videoStats.totalVideos}
                </div>
              </div>
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <PlayCircleIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-charcoal-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-charcoal-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-2">
                  <EyeIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Total Views</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {videoStats.totalViews.toLocaleString()}
                </div>
              </div>
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <EyeIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );

  const renderVideoPlayer = () => (
    <motion.div
      key="player"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8"
    >
      <div className="max-w-5xl mx-auto">
        <VideoPlayer
          video={selectedVideo}
          onVideoEnd={handleVideoEnd}
          className="w-full"
        />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-charcoal-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-charcoal-800">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {selectedVideo.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-2">
                  <EyeIcon className="w-4 h-4" />
                  <span>{selectedVideo.views?.toLocaleString()} views</span>
                </div>

                {selectedVideo.duration && (
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>
                      {Math.floor(selectedVideo.duration / 60)}:
                      {(selectedVideo.duration % 60)
                        .toString()
                        .padStart(2, "0")}
                    </span>
                  </div>
                )}

                {selectedVideo.subject && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                    <AcademicCapIcon className="w-3 h-3 mr-1" />
                    {selectedVideo.subject.name}
                  </span>
                )}
              </div>

              {selectedVideo.description && (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedVideo.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {relatedVideos.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Related Videos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="group cursor-pointer"
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="bg-white dark:bg-charcoal-900 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-charcoal-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="relative aspect-video bg-gray-200 dark:bg-charcoal-800">
                      <img
                        src={video.thumbnail || "/placeholder-video.jpg"}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 dark:bg-white/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PlayCircleIcon className="w-6 h-6 text-primary-600" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {video.title}
                      </h4>

                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        <span>{video.views?.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8 transition-colors duration-200">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
    
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderHeader()}

        <AnimatePresence mode="wait">
          {currentView === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <VideoList
                onVideoSelect={handleVideoSelect}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
              />
            </motion.div>
          )}

          {currentView === "player" && selectedVideo && renderVideoPlayer()}
        </AnimatePresence>

        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title=""
          size="lg"
          showCloseButton={false}
        >
          <VideoUpload
            onVideoUploaded={handleVideoUpload}
            onClose={() => setShowUploadModal(false)}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Videos;
