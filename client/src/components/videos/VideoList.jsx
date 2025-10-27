import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlayCircleIcon,
  ClockIcon,
  EyeIcon,
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { videoAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { useDebounce } from "../../hooks/useDebounce";
import toast from "react-hot-toast";

const VideoList = ({ onVideoSelect, selectedSubject, setSelectedSubject }) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showPaidOnly, setShowPaidOnly] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const subjects = [
    { id: "", name: "All Subjects" },
    { id: "mathematics", name: "Mathematics" },
    { id: "english", name: "English Language" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "biology", name: "Biology" },
  ];

  useEffect(() => {
    fetchVideos();
  }, [page, debouncedSearchTerm, selectedSubject, sortBy, showPaidOnly]);

  const fetchVideos = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: 12,
        search: debouncedSearchTerm,
        subject: selectedSubject || undefined,
        sortBy,
        isPaid: showPaidOnly ? true : undefined,
      };

      const response = await videoAPI.getVideos(params);
      const { data, pagination } = response.data.data;

      setVideos(Array.isArray(data) ? data : []);
      setTotalPages(pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to load videos:", error);
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "Unknown";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleVideoClick = (video) => {
    if (video.isPremium && !user?.isPremium && user?.role !== "ADMIN") {
      toast.error("Paid subscription required to watch this video");
      return;
    }
    onVideoSelect(video);
  };

  if (loading && videos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading videos..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Subject Filter */}
          <div className="flex items-center space-x-2">
            <AcademicCapIcon className="w-5 h-5 text-gray-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input"
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="title">Alphabetical</option>
              <option value="duration">Duration</option>
            </select>
          </div>

          {/* Paid videos Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="paid-only"
              checked={showPaidOnly}
              onChange={(e) => setShowPaidOnly(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="paid-only"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Paid Only
            </label>
          </div>
        </div>
      </motion.div>

      {/* Video Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-12">
          <PlayCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Videos Found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search criteria or check back later for new
            content
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group cursor-pointer"
              onClick={() => handleVideoClick(video)}
            >
              <div className="card-hover overflow-hidden">
                {/* Video Thumbnail */}
                <div className="relative">
                  <img
                    src={video.thumbnail || "/placeholder-video.jpg"}
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PlayCircleIcon className="w-8 h-8 text-primary-600" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}

                  {/* Premium Badge */}
                  {video.isPremium && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                      <StarIcon className="w-3 h-3" />
                      <span>Paid Courses</span>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {video.title}
                  </h3>

                  {video.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      {video.views && (
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{video.views.toLocaleString()} views</span>
                        </div>
                      )}

                      {video.subject && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {video.subject.name}
                        </span>
                      )}
                    </div>

                    {video.isPremium &&
                      !user?.isPremium &&
                      user?.role !== "ADMIN" && (
                        <div className="flex items-center space-x-1 text-warning-600">
                          <StarIcon className="w-4 h-4" />
                          <span className="text-xs">Premium</span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-2"
        >
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn btn-outline btn-sm"
          >
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="btn btn-outline btn-sm"
          >
            Next
          </button>
        </motion.div>
      )}

      {loading && (
        <div className="flex justify-center">
          <LoadingSpinner size="md" text="Loading more videos..." />
        </div>
      )}
    </div>
  );
};

export default VideoList;
