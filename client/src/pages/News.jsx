import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NewspaperIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import NewsList from "../components/news/NewsList";
import NewsDetail from "../components/news/NewsDetail";
import NewsEditor from "../components/news/NewsEditor";
import Modal from "../components/common/Modal";
import { newsAPI } from "../services/api";

const News = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState("list"); // list, detail, editor
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [newsStats, setNewsStats] = useState({
    totalArticles: 0,
    todayArticles: 0,
    totalViews: 0,
  });

  useEffect(() => {
    fetchFeaturedArticles();
    fetchNewsStats();
  }, []);

  const fetchFeaturedArticles = async () => {
    try {
      const response = await newsAPI.getLatestNews({ limit: 3 });
      setFeaturedArticles(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch featured articles:", error);
    }
  };

  const fetchNewsStats = async () => {
    try {
      const response = await newsAPI.getNewsStats();
      const data = response.data?.data;

      if (data) {
        setNewsStats({
          totalArticles: data.totalArticles || 0,
          todayArticles: data.todayArticles || 0,
          totalViews: data.totalViews || 0,
        });
      } else {
        console.warn("No stats data returned from API");
      }
    } catch (error) {
      console.error("Failed to fetch news stats:", error);
      toast.error("Failed to load news statistics");
    }
  };

  const handleArticleClick = (article) => {
    setSelectedArticleId(article.id);
    setCurrentView("detail");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedArticleId(null);
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setShowEditor(true);
  };

  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setShowEditor(true);
  };

  const handleArticleSave = () => {
    setShowEditor(false);
    setEditingArticle(null);
    // Refresh the list
    fetchFeaturedArticles();
    fetchNewsStats();
  };

  const renderHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 "
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-gray-900 dark:text-white mb-2">
            {currentView === "detail" ? "Article" : "News & Updates"}
          </h1>
          {currentView === "list" && (
            <p className="text-gray-600 dark:text-gray-300">
              Stay informed with the latest educational insights and
              announcements
            </p>
          )}
        </div>

        {user?.role === "ADMIN" && currentView === "list" && (
          <button
            onClick={handleCreateArticle}
            className="btn btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Article</span>
          </button>
        )}
      </div>

      {/* Stats Bar (only on list view) */}
      {currentView === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-4 text-center"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3 mx-auto">
              <NewspaperIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {newsStats.totalArticles}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Total Articles</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4 text-center"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3 mx-auto">
              <ClockIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {newsStats.todayArticles}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Articles Today</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-4 text-center"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3 mx-auto">
              <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {newsStats.totalViews.toLocaleString()}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Total Views</p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen section-padding bg-gradient-to-br from-slate-50 to-blue-50 dark:from-charcoal-900 dark:to-charcoal-800 py-8">
      <motion.div
        className="absolute top-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {renderHeader()}

      <AnimatePresence mode="wait">
        {currentView === "list" && (
          <NewsList
            key="news-list"
            onArticleClick={handleArticleClick}
            onEdit={handleEditArticle}
            featuredArticles={featuredArticles}
          />
        )}

        {currentView === "detail" && selectedArticleId && (
          <NewsDetail
            key="news-detail"
            articleId={selectedArticleId}
            onBack={handleBackToList}
          />
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <Modal isOpen={showEditor} onClose={() => setShowEditor(false)} size="lg">
        <NewsEditor
          article={editingArticle}
          onSave={handleArticleSave}
          onCancel={() => setShowEditor(false)}
        />
      </Modal>
    </div>
  );
};

export default News;
