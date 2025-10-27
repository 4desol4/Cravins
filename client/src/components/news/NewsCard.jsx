import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const NewsCard = ({ article, index = 0, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content ? content.trim().split(/\s+/).length : 0;
    return Math.ceil(words / wordsPerMinute);
  };

  const getSourceBadgeColor = (source) => {
    return source === "EXTERNAL"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={() => onClick?.(article)}
    >
      <div className="card-hover h-full overflow-hidden">
        {/* Article Image */}
        {article.image && (
          <div className="relative overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Source Badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getSourceBadgeColor(
                  article.source
                )}`}
              >
                {article.source === "EXTERNAL" ? "External" : "Cravins"}
              </span>
            </div>

            {/* External Link Icon */}
            {article.externalUrl && (
              <div className="absolute top-3 right-3">
                <ArrowTopRightOnSquareIcon className="w-5 h-5 text-white bg-black/50 p-1 rounded" />
              </div>
            )}
          </div>
        )}

        {/* Article Content */}
        <div className="p-6">
          {/* Category */}
          {article.category && (
            <div className="mb-3">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                {article.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {article.title}
          </h2>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {article.excerpt}
            </p>
          )}

          {/* Article Meta */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <CalendarDaysIcon className="w-4 h-4" />
                <span>
                  {formatDate(article.publishedAt || article.createdAt)}
                </span>
              </div>

              {article.views && (
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{article.views.toLocaleString()} views</span>
                </div>
              )}

              {article.content && (
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{getReadingTime(article.content)} min read</span>
                </div>
              )}
            </div>

            {/* Read More Link */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(article);
              }}
              className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
            >
              Read more →
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default NewsCard;
