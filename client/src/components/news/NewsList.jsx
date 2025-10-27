import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  NewspaperIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { newsAPI } from "../../services/api";
import NewsCard from "./NewsCard";
import LoadingSpinner from "../common/LoadingSpinner";
import { useDebounce } from "../../hooks/useDebounce";
import toast from "react-hot-toast";

const NewsList = ({ onArticleClick }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const categories = [
    { id: "", name: "All Categories" },
    { id: "Education News", name: "Education News" },
    { id: "Exam Updates", name: "Exam Updates" },
    { id: "Study Tips", name: "Study Tips" },
    { id: "Announcements", name: "Announcements" },
    { id: "Technology", name: "Technology" },
    { id: "Scholarships", name: "Scholarships" },
  ];

  const sources = [
    { id: "", name: "All Sources" },
    { id: "INTERNAL", name: "Cravins News" },
    { id: "EXTERNAL", name: "External News" },
  ];

  useEffect(() => {
    fetchArticles();
  }, [page, debouncedSearchTerm, selectedCategory, selectedSource, sortBy]);
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        search: debouncedSearchTerm || undefined,
        category: selectedCategory || undefined,
        source: selectedSource || undefined,
        sortBy,
      };

      const response = await newsAPI.getNews(params);
      console.log("News API response:", response.data);

      // ✅ Extract properly
      const data = response.data?.data?.data || [];
      const normalized = data.map((a) => ({
        ...a,
        id: a.id || a._id,
      }));

      setArticles(normalized);
      setTotalPages(response.data?.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to load news articles:", error);
      toast.error("Failed to load news articles");
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (article) => {
    onArticleClick?.(article);
  };

  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading news..." />
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
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <TagIcon className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center space-x-2">
            <NewspaperIcon className="w-5 h-5 text-gray-400" />
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="input"
            >
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
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
              <option value="views">Most Viewed</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <NewspaperIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Articles Found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search criteria or check back later for new
            content
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <NewsCard
              key={article.id}
              article={article}
              index={index}
              onClick={handleArticleClick}
            />
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
          <LoadingSpinner size="md" text="Loading more articles..." />
        </div>
      )}
    </div>
  );
};

export default NewsList;
