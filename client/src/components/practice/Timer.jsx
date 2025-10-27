import { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const Timer = ({
  initialTime, 
  onTimeUp,
  onTimeChange,
  autoStart = true,
  showWarnings = true,
  className = "",
}) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);

  
  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
  if (!isRunning || time <= 0) return;

  const intervalId = setInterval(() => {
    setTime((prevTime) => {
      const newTime = prevTime - 1;

      if (onTimeChange) onTimeChange(newTime);

      if (newTime <= 0) {
        clearInterval(intervalId);
        setIsRunning(false);
        if (onTimeUp) onTimeUp();
        return 0;
      }

      return newTime;
    });
  }, 1000);

  // Cleanup on pause/unmount
  return () => clearInterval(intervalId);
}, [isRunning]);


  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };


  const percentage = initialTime > 0 ? (time / initialTime) * 100 : 0;

  // Dynamic colors
  const getTimeColor = () => {
    if (percentage > 50) return "text-success-600 dark:text-success-400";
    if (percentage > 25) return "text-warning-600 dark:text-warning-400";
    return "text-error-600 dark:text-error-400";
  };

  const getProgressColor = () => {
    if (percentage > 50) return "from-success-500 to-success-600";
    if (percentage > 25) return "from-warning-500 to-warning-600";
    return "from-error-500 to-error-600";
  };

  const toggleTimer = () => setIsRunning((prev) => !prev);

  const resetTimer = () => {
    setTime(initialTime);
    setIsRunning(autoStart);
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Time Display */}
      <div className="flex items-center space-x-2">
        <ClockIcon className={`w-5 h-5 ${getTimeColor()}`} />
        <div className={`font-mono text-lg font-bold ${getTimeColor()}`}>
          {formatTime()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 max-w-xs hidden sm:block">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleTimer}
          className={`btn btn-sm ${
            isRunning
              ? "btn-outline text-warning-600 border-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20"
              : "btn-primary"
          }`}
        >
          {isRunning ? "Pause" : "Resume"}
        </button>
        <button
          onClick={resetTimer}
          className="btn btn-sm btn-outline text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Reset
        </button>
      </div>

      {/* Warning */}
      {showWarnings && percentage <= 10 && percentage > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="text-error-600 dark:text-error-400 text-sm font-medium animate-pulse"
        >
          ⚠️ Time almost up!
        </motion.div>
      )}
    </div>
  );
};

export default Timer;
