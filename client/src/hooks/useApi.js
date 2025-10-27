import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction(...args);
        setData(response.data?.data || response.data);
      } catch (err) {
        setError(err);
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    fetchData,
  };
};

export const useAsyncAction = (asyncFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        return { success: true, data: result };
      } catch (err) {
        setError(err);
        const message =
          err.response?.data?.message || err.message || "An error occurred";
        toast.error(message);
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  return {
    execute,
    loading,
    error,
  };
};
