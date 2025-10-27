import { motion } from "framer-motion";
import { ArrowUpIcon, ArrowDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  loading = false,
  trend,
  trendValue,
}) => {
  const colorClasses = {
    primary: "from-primary-500 to-primary-600",
    secondary: "from-secondary-500 to-secondary-600",
    success: "from-success-500 to-success-600",
    warning: "from-warning-500 to-warning-600",
    error: "from-error-500 to-error-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-charcoal-900 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-charcoal-800">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
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
                trend === "up"
                  ? "text-success-600 dark:text-success-400"
                  : "text-error-600 dark:text-error-400"
              }`}
            >
              <ArrowTrendingUpIcon
                className={`w-3 h-3 ${trend === "down" && "rotate-180"}`}
              />
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

export default StatsCard;
