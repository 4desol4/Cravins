import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  CloudArrowUpIcon,
  LinkIcon,
  XMarkIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";

const VideoUpload = ({
  onVideoUploaded,
  onClose,
  editMode = false,
  existingVideo = null,
}) => {
  const [uploadType, setUploadType] = useState(
    editMode && existingVideo?.url?.includes("youtube") ? "youtube" : "file"
  );
  const [formData, setFormData] = useState({
    title: existingVideo?.title || "",
    description: existingVideo?.description || "",
    url: existingVideo?.url || "",
    subjectId: existingVideo?.subjectId || "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const subjects = [
    { id: "", name: "Select Subject" },
    { id: "mathematics", name: "Mathematics" },
    { id: "english", name: "English Language" },
    { id: "biology", name: "Biology" },
    { id: "chemistry", name: "Chemistry" },
    { id: "physics", name: "Physics" },
    { id: "economics", name: "Economics" },
    { id: "commerce", name: "Commerce" },
    { id: "accounting", name: "Accounting" },
    { id: "government", name: "Government" },
    { id: "literature", name: "Literature in English" },
    { id: "geography", name: "Geography" },
    { id: "agricultural_science", name: "Agricultural Science" },
    { id: "civic_education", name: "Civic Education" },
    { id: "christian_religious_studies", name: "Christian Religious Studies" },
    { id: "islamic_religious_studies", name: "Islamic Religious Studies" },
    { id: "yoruba", name: "Yoruba" },
    { id: "igbo", name: "Igbo" },
    { id: "hausa", name: "Hausa" },
    { id: "french", name: "French" },
    { id: "further_mathematics", name: "Further Mathematics" },
    { id: "computer_science", name: "Computer Science/ICT" },
    { id: "technical_drawing", name: "Technical Drawing" },
    { id: "food_and_nutrition", name: "Food and Nutrition" },
    { id: "home_management", name: "Home Management" },
    { id: "clothing_and_textiles", name: "Clothing and Textiles" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size must be less than 100MB");
        return;
      }

      const allowedTypes = [
        "video/mp4",
        "video/avi",
        "video/mov",
        "video/wmv",
        "video/webm",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only MP4, AVI, MOV, WMV, and WEBM files are allowed");
        return;
      }

      setSelectedFile(file);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return false;
    }

    if (uploadType === "youtube") {
      if (!formData.url.trim()) {
        toast.error("YouTube URL is required");
        return false;
      }

      const youtubeRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(formData.url)) {
        toast.error("Please enter a valid YouTube URL");
        return false;
      }
    } else if (uploadType === "file" && !editMode) {
      if (!selectedFile) {
        toast.error("Please select a video file");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      let response;

      if (editMode) {
        // Update existing video
        const updateData = {
          title: formData.title,
          description: formData.description,
          subjectId: formData.subjectId || null,
        };

        if (uploadType === "youtube" && formData.url !== existingVideo?.url) {
          updateData.url = formData.url;
        }

        response = await adminAPI.updateAdminVideo(
          existingVideo.id,
          updateData
        );
        toast.success("Video updated successfully!");
      } else {
        // Create new video
        if (uploadType === "youtube") {
          const youtubeData = {
            title: formData.title,
            description: formData.description,
            url: formData.url,
            subjectId: formData.subjectId || null,
            isYouTube: true,
          };

          response = await adminAPI.addAdminYouTubeVideo(youtubeData);
        } else {
          const formDataToSend = new FormData();
          formDataToSend.append("video", selectedFile);
          formDataToSend.append("title", formData.title);
          formDataToSend.append("description", formData.description);
          formDataToSend.append("subjectId", formData.subjectId || "");

          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return prev;
              }
              return prev + 10;
            });
          }, 500);

          response = await adminAPI.uploadAdminVideo(formDataToSend);
          clearInterval(progressInterval);
        }

        toast.success("Video uploaded successfully!");
      }

      setUploadProgress(100);
      onVideoUploaded?.(response.data.data);
      onClose?.();
    } catch (error) {
      const message = error.response?.data?.message || "Operation failed";
      toast.error(message);
      console.error("Video operation error:", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white dark:bg-charcoal-900 rounded-xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editMode ? "Edit Video" : "Upload Video"}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        {!editMode && (
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setUploadType("youtube")}
                className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                  uploadType === "youtube"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                    : "border-gray-200 dark:border-charcoal-700 hover:border-primary-300 dark:hover:border-primary-700"
                }`}
              >
                <LinkIcon className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">YouTube Link</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Add video from YouTube
                </div>
              </button>

              <button
                onClick={() => setUploadType("file")}
                className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                  uploadType === "file"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                    : "border-gray-200 dark:border-charcoal-700 hover:border-primary-300 dark:hover:border-primary-700"
                }`}
              >
                <CloudArrowUpIcon className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">Upload File</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Upload video file
                </div>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter video title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2.5 bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter video description"
            />
          </div>

          {uploadType === "youtube" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
          ) : (
            !editMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video File
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-charcoal-700 rounded-lg p-6 bg-gray-50 dark:bg-charcoal-800">
                  <div className="text-center">
                    <VideoCameraIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {selectedFile ? selectedFile.name : "Select video file"}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mb-4">
                      MP4, AVI, MOV, WMV, WEBM up to 100MB
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="video-upload"
                      ref={fileInputRef}
                    />
                    <label
                      htmlFor="video-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-charcoal-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-charcoal-800 hover:bg-gray-50 dark:hover:bg-charcoal-700 cursor-pointer transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                </div>
              </div>
            )
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject (Optional)
            </label>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {uploading && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {uploadType === "youtube" ? "Processing..." : "Uploading..."}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-charcoal-700 rounded-full h-2">
                <motion.div
                  className="bg-primary-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 dark:border-charcoal-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-charcoal-800 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>
                    {editMode
                      ? "Updating..."
                      : uploadType === "youtube"
                      ? "Adding..."
                      : "Uploading..."}
                  </span>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-5 h-5" />
                  <span>
                    {editMode
                      ? "Update Video"
                      : uploadType === "youtube"
                      ? "Add Video"
                      : "Upload Video"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default VideoUpload;
