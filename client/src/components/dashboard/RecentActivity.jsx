import { motion } from "framer-motion";
import {
  BookOpenIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const RecentActivity = ({ activities = [], loading = false }) => {
  const getActivityIcon = (type) => {
    const icons = {
      test: BookOpenIcon,
      video: PlayCircleIcon,
      material: DocumentTextIcon,
      default: ClockIcon,
    };
    return icons[type] || icons.default;
  };

  const getActivityColor = (type) => {
    const colors = {
      test: "text-primary-600 bg-primary-100",
      video: "text-success-600 bg-success-100",
      material: "text-warning-600 bg-warning-100",
      default: "text-gray-600 bg-gray-100",
    };
    return colors[type] || colors.default;
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400">
              Start learning to see your activity here
            </p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <motion.div
                key={activity.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-charcoal-700 transition-colors"
              >
                <div
                  className={`p-2 rounded-full ${getActivityColor(
                    activity.type
                  )}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-900  dark:text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {activity.description}
                  </p>
                </div>
                <div className="text-xs text-gray-400">{activity.timeAgo}</div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default RecentActivity;
