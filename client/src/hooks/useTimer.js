import { useState, useEffect, useCallback } from "react";

export const useTimer = (initialTime, options = {}) => {
  const { onComplete, autoStart = false, interval = 1000 } = options;
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    let intervalId;

    if (isRunning && time > 0) {
      intervalId = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prevTime - 1;
        });
      }, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, time, interval, onComplete]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(
    (newTime = initialTime) => {
      setTime(newTime);
      setIsRunning(false);
    },
    [initialTime]
  );

  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  return {
    time,
    formattedTime: formatTime(time),
    isRunning,
    start,
    pause,
    reset,
    setTime,
  };
};
