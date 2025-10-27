import { useState } from "react";
import { motion } from "framer-motion";
import {
  PhotoIcon,
  XMarkIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { newsAPI } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import toast from "react-hot-toast";

const NewsEditor = ({ article = null, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: article?.title || "",
    content: article?.content || "",
    excerpt: article?.excerpt || "",
    category: article?.category || "Education News",
    isPublished: article?.isPublished || false,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(article?.image || null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    "Education News",
    "Exam Updates",
    "Study Tips",
    "Announcements",
    "Technology",
    "Scholarships",
    "Academic Events",
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return false;
    }

    if (!formData.content.trim()) {
      toast.error("Content is required");
      return false;
    }

    if (formData.content.length < 50) {
      toast.error("Content must be at least 50 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("content", formData.content);
      submitData.append(
        "excerpt",
        formData.excerpt || formData.content.substring(0, 200)
      );
      submitData.append("category", formData.category);
      submitData.append("isPublished", formData.isPublished);

      if (selectedImage) {
        submitData.append("image", selectedImage);
      }

      let response;
      if (article) {
        response = await newsAPI.updateNews(article.id, submitData);
        toast.success("Article updated successfully!");
      } else {
        response = await newsAPI.createNews(submitData);
        toast.success("Article created successfully!");
      }

      onSave?.(response.data.data);
      onClose?.();
    } catch (error) {
      const message = error.response?.data?.message || "Operation failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => (
    <div className="space-y-4">
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Article preview"
          className="w-full h-64 object-cover rounded-lg"
        />
      )}

      <div className="space-y-2">
        <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
          {formData.category}
        </span>
        <h1 className="text-2xl font-bold text-gray-900">{formData.title}</h1>
        <div className="prose max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: formData.content.replace(/\n/g, "<br>"),
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {article ? "Edit Article" : "Create New Article"}
          </h2>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="btn btn-outline btn-sm flex items-center space-x-2"
            >
              <EyeIcon className="w-4 h-4" />
              <span>{showPreview ? "Edit" : "Preview"}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {showPreview ? (
          renderPreview()
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="label">Featured Image (Optional)</label>

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Upload article image
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 mb-4">
                      PNG, JPG, GIF up to 5MB
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="btn btn-outline cursor-pointer"
                    >
                      Choose Image
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="label">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Enter article title"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input w-full"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Excerpt */}
            <div>
              <label className="label">Excerpt (Optional)</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="input w-full"
                placeholder="Brief description of the article (will be auto-generated if left empty)"
              />
            </div>

            {/* Content */}
            <div>
              <label className="label">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={15}
                className="input w-full"
                placeholder="Write your article content here..."
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.content.length} characters
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isPublished"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Publish article immediately
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-3">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline"
                  disabled={loading}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">
                      {article ? "Updating..." : "Creating..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{article ? "Update Article" : "Create Article"}</span>
                    <PlusIcon className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default NewsEditor;
