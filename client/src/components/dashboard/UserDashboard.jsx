import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpenIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  StarIcon,
  ClockIcon,
  ArrowRightIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { userAPI, newsAPI } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import LoadingSpinner from "../common/LoadingSpinner";
import toast from "react-hot-toast";

const StatsCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  const colorClasses = {
    primary: "from-primary-500 to-primary-600",
    secondary: "from-secondary-500 to-secondary-600",
    success: "from-success-500 to-success-600",
    warning: "from-warning-500 to-warning-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white dark:bg-charcoal-900 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-charcoal-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            {value}
          </h3>
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs ${
                trend === "up" ? "text-success-600" : "text-error-600"
              }`}
            >
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        <div
          className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-md`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};
const ProfileSettingsModal = ({ isOpen, onClose, user, onAvatarUpload }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      await userAPI.uploadAvatar(formData);
      toast.success("Avatar updated successfully");
      onAvatarUpload();
      onClose();
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-charcoal-900 rounded-xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal-800 rounded-lg"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Current Avatar */}
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-4xl shadow-lg mb-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              )}
            </div>

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn btn-primary"
            >
              {uploading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 8z"
                    />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                  Change Avatar
                </>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <p className="text-xs text-gray-500 mt-2">
              Max file size: 5MB. Supported formats: JPG, PNG, GIF
            </p>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 dark:bg-charcoal-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user?.email}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span
                className={`font-medium ${
                  user?.hasPaid ? "text-green-600" : "text-gray-600"
                }`}
              >
                {user?.hasPaid ? "PAID" : "FREE"}
              </span>
            </div>
            {user?.hasPaid && user?.paymentType && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {user.paymentType}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn btn-outline">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
const QuickActionCard = ({ title, description, icon: Icon, href, color }) => {
  const colorClasses = {
    primary: "from-primary-500 to-primary-600",
    success: "from-success-500 to-success-600",
    warning: "from-warning-500 to-warning-600",
    secondary: "from-secondary-500 to-secondary-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Link to={href} className="group block">
        <div className="bg-white dark:bg-charcoal-900 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all border border-gray-100 dark:border-charcoal-800">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} group-hover:scale-110 transition-transform shadow-md`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-sm sm:text-base">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {description}
              </p>
            </div>
            <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const AccessStatusBanner = ({ user }) => {
  const hasPaid = user?.hasPaid;
  const paymentType = user?.paymentType;
  const paymentExpiry = user?.paymentExpiry;

  const isExpired = paymentExpiry && new Date(paymentExpiry) < new Date();
  const daysRemaining = paymentExpiry
    ? Math.ceil((new Date(paymentExpiry) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  if (!hasPaid || isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-4 sm:p-6 mb-6 shadow-lg"
      >
        <div className="flex items-start gap-4">
          <ExclamationTriangleIcon className="w-8 h-8 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">
              {isExpired ? "Access Expired" : "Free User - Limited Access"}
            </h3>
            <p className="text-sm mb-3">
              {isExpired
                ? "Your access has expired. Upgrade to continue enjoying full features."
                : "You're currently on the free plan with limited access. Upgrade to unlock all features!"}
            </p>
            <Link
              to="/payments"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <SparklesIcon className="w-5 h-5" />
              Upgrade Now
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (daysRemaining && daysRemaining <= 7) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-4 sm:p-6 mb-6 shadow-lg"
      >
        <div className="flex items-start gap-4">
          <CalendarIcon className="w-8 h-8 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Access Expiring Soon</h3>
            <p className="text-sm mb-3">
              Your {paymentType?.toLowerCase()} access expires in{" "}
              {daysRemaining} days. Renew now to avoid interruption.
            </p>
            <Link
              to="/payments"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Renew Access
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 sm:p-6 mb-6 shadow-lg"
    >
      <div className="flex items-start gap-4">
        <ShieldCheckIcon className="w-8 h-8 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">
            {paymentType === "LIFETIME"
              ? "Lifetime Access Active"
              : `${paymentType} Access Active`}
          </h3>
          <p className="text-sm">
            {paymentType === "LIFETIME"
              ? "You have lifetime access to all features. Thank you for being a valued member!"
              : `Your access is active and will ${
                  paymentExpiry
                    ? `expire on ${new Date(
                        paymentExpiry
                      ).toLocaleDateString()}`
                    : "continue"
                }.`}
          </p>
        </div>
        <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
          <div className="text-xs font-medium">Status</div>
          <div className="text-lg font-bold">ACTIVE</div>
        </div>
      </div>
    </motion.div>
  );
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { data: latestNews } = useApi(() =>
    newsAPI.getLatestNews({ limit: 3 })
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };
  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setAvatarUploading(true);

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await userAPI.uploadAvatar(formData);

      // Update user context if you have one
      toast.success("Avatar updated successfully");

      // Refresh dashboard to show new avatar
      fetchDashboardData();
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const quickActions = [
    {
      title: "Start Practice Test",
      description: user?.hasPaid
        ? "Unlimited questions"
        : "Try 5 free questions",
      icon: BookOpenIcon,
      href: "/practice",
      color: "primary",
    },
    {
      title: "Watch Video Lessons",
      description: "Learn from experts",
      icon: PlayCircleIcon,
      href: "/videos",
      color: "success",
    },
    {
      title: "Browse Materials",
      description: user?.hasPaid ? "Download materials" : "View materials",
      icon: DocumentTextIcon,
      href: "/materials",
      color: "warning",
    },
    {
      title: "Chat with AI Tutor",
      description: "Get personalized help",
      icon: ChatBubbleLeftRightIcon,
      href: "/chatbot",
      color: "secondary",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container-max section-padding py-4 sm:py-8">
        {/* Access Status Banner */}
        <AccessStatusBanner user={user} />

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {dashboardData?.user?.avatar ? (
                    <img
                      src={dashboardData.user.avatar}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </span>
                  )}
                </div>

                {/* Upload Button Overlay */}
                <button
                  onClick={triggerAvatarUpload}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 bg-white dark:bg-charcoal-900 rounded-full p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-charcoal-800 transition-colors border-2 border-primary-500"
                  title="Change avatar"
                >
                  {avatarUploading ? (
                    <svg
                      className="w-4 h-4 animate-spin text-primary-600"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 8z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading text-gray-900 dark:text-white">
                  Welcome back, {user?.firstName}! 👋
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                  {user?.hasPaid
                    ? "Enjoy your full access"
                    : "Start your learning journey"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              className="btn btn-outline btn-sm"
            >
              <CogIcon className="w-4 h-4 mr-2" />
              Profile Settings
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Tests Completed"
            value={dashboardData?.stats?.totalTests || 0}
            icon={BookOpenIcon}
            color="blue"
            trend="up"
            trendValue="+5"
          />
          <StatsCard
            title="Average Score"
            value={`${Math.round(dashboardData?.stats?.averageScore || 0)}%`}
            icon={TrophyIcon}
            color="success"
          />
          <StatsCard
            title="Highest Score"
            value={`${Math.round(dashboardData?.stats?.highestScore || 0)}%`}
            icon={StarIcon}
            color="warning"
          />
          <StatsCard
            title="Materials Owned"
            value={dashboardData?.stats?.materialsOwned || 0}
            icon={DocumentTextIcon}
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </div>
        </motion.div>

        {/* Recent Tests & News */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tests */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-charcoal-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Tests
                </h2>
                <Link
                  to="/practice/history"
                  className="text-primary-600 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              {!dashboardData?.recentTests ||
              dashboardData.recentTests.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No tests taken yet
                  </p>
                  <Link to="/practice" className="btn btn-primary btn-sm mt-4">
                    Start Practice
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData.recentTests.map((test, index) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-charcoal-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {test.testName}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(test.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          test.score >= 80
                            ? "text-success-600"
                            : test.score >= 60
                            ? "text-warning-600"
                            : "text-error-600"
                        }`}
                      >
                        {Math.round(test.score)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Latest News */}
          <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-charcoal-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Latest News
              </h3>
              <Link to="/news" className="text-primary-600 text-sm font-medium">
                View All
              </Link>
            </div>
            {latestNews && latestNews.length > 0 ? (
              <div className="space-y-4">
                {latestNews.map((news) => (
                  <Link
                    key={news.id}
                    to={`/news/${news.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-charcoal-800"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                      {news.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(news.publishedAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No news available
              </p>
            )}
          </div>
        </div>
      </div>
      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onAvatarUpload={fetchDashboardData}
      />
      ;
    </div>
  );
};

export default UserDashboard;
