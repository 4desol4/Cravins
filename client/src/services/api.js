import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      toast.error("Session expired. Please login again.");
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.post("/auth/change-password", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
};

// User API
export const userAPI = {
  getDashboard: () => api.get("/users/dashboard"),

  uploadAvatar: (formData) =>
    api.post("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getAchievements: () => api.get("/users/achievements"),
  getNotifications: () => api.get("/users/notifications"),
};
// Practice API

export const practiceAPI = {
  getSubjects: () => api.get("/practice/subjects"),
  getTopics: (subjectIds, page = 1, limit = 14) =>
    api.post("/practice/topics", { subjectIds, page, limit }),

  generateMoreTopics: (subjectId) =>
    api.post("/practice/topics/generate", { subjectId }),

  startTest: (data) =>
    api.post("/practice/start", {
      ...data,
      useRandomTopics: data.useRandomTopics || false,
    }),

  submitTest: (data) => api.post("/practice/submit", data),
  getTestHistory: (params) => api.get("/practice/history", { params }),
  getTestResult: (testId) => api.get(`/practice/result/${testId}`),
  downloadTestPDF: (testId) =>
    api.get(`/practice/download/${testId}`, {
      responseType: "blob",
    }),
  getUserStats: () => api.get("/practice/stats"),
};

// Video API
export const videoAPI = {
  getVideos: (params) => api.get("/videos", { params }),
  getVideo: (videoId) => api.get(`/videos/${videoId}`),
  // Admin endpoints - these now point to the admin routes
  uploadVideo: (formData) =>
    api.post("/admin/videos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  addYouTubeVideo: (data) => api.post("/admin/videos/youtube", data),
  updateVideo: (videoId, data) => api.put(`/admin/videos/${videoId}`, data),
  deleteVideo: (videoId) => api.delete(`/admin/videos/${videoId}`),
};
// Material API
export const materialAPI = {
  // Get all materials
  getMaterials: (params) => api.get("/materials", { params }),

  // Get single material
  getMaterial: (materialId) => api.get(`/materials/${materialId}`),

  // Download material (requires payment)
  downloadMaterial: (materialId) =>
    api.get(`/materials/download/${materialId}`,{
      responseType: "blob",
    }),
  // Get downloaded materials
  getDownloadedMaterials: (params) =>
    api.get("/materials/downloaded", { params }),

  // Admin endpoints
  uploadMaterial: (formData) =>
    api.post("/materials/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateMaterial: (materialId, data) =>
    api.put(`/materials/${materialId}`, data),
  deleteMaterial: (materialId) => api.delete(`/materials/${materialId}`),
  getMaterialStats: () => api.get("/materials/stats"),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (data) => api.post("/chatbot/message", data),
  getChatSessions: () => api.get("/chatbot/sessions"),
  getChatMessages: (sessionId) =>
    api.get(`/chatbot/sessions/${sessionId}/messages`),
  deleteChatSession: (sessionId) =>
    api.delete(`/chatbot/sessions/${sessionId}`),
};

// News API
export const newsAPI = {
  getNews: (params) => api.get("/news", { params }),
  getNewsArticle: (newsId) => api.get(`/news/${newsId}`),
  getLatestNews: (params) => api.get("/news/latest", { params }),
  getNewsStats: () => api.get("/news/stats"),
  // Admin endpoints
  createNews: (formData) =>
    api.post("/news", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateNews: (newsId, formData) =>
    api.put(`/news/${newsId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteNews: (newsId) => api.delete(`/news/${newsId}`),
  getPendingExternalNews: () => api.get("/news/admin/pending-external"),
  approveExternalNews: (data) => api.post("/news/admin/approve-external", data),
};

// Payment API
export const paymentAPI = {
  // Get available payment plans
  getPaymentPlans: () => api.get("/payments/plans"),

  // Initialize payment for access
  initializePayment: (data) => api.post("/payments/initialize", data),

  // Verify payment
  verifyPayment: (reference) => api.get(`/payments/verify/${reference}`),

  // Get payment history
  getPaymentHistory: () => api.get("/payments/history"),

  // Get current access status
  getAccessStatus: () => api.get("/payments/status"),
};

// Admin Payment Settings API
export const adminPaymentAPI = {
  // Get payment settings
  getPaymentSettings: () => api.get("/admin/payment-settings"),

  // Update payment settings
  updatePaymentSettings: (data) => api.put("/admin/payment-settings", data),

  // Toggle payment system
  togglePaymentSystem: (enabled) =>
    api.post("/admin/payment-settings/toggle", { enabled }),

  // Get payment statistics
  getPaymentStats: () => api.get("/admin/payment-stats"),

  // Grant manual access to user
  grantManualAccess: (userId, data) =>
    api.post(`/admin/users/${userId}/grant-access`, data),

  // Revoke user access
  revokeUserAccess: (userId) =>
    api.delete(`/admin/users/${userId}/revoke-access`),
};

// Enhanced Admin API with all necessary endpoints
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get("/admin/dashboard"),
  getAnalytics: (params) => api.get("/admin/analytics", { params }),

  // Users
  getUsers: (params) => api.get("/admin/users", { params }),
  getUser: (userId) => api.get(`/admin/users/${userId}`),
  updateUserStatus: (userId, data) =>
    api.put(`/admin/users/${userId}/status`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  // Subjects
  getSubjects: () => api.get("/admin/subjects"),
  createSubject: (data) => api.post("/admin/subjects", data),
  updateSubject: (subjectId, data) =>
    api.put(`/admin/subjects/${subjectId}`, data),
  deleteSubject: (subjectId) => api.delete(`/admin/subjects/${subjectId}`),
  initializeSubjects: () => api.post("/admin/subjects/initialize"),

  // Video Management
  getAdminVideos: (params) => api.get("/admin/videos", { params }),
  uploadAdminVideo: (formData) =>
    api.post("/admin/videos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  addAdminYouTubeVideo: (data) => api.post("/admin/videos/youtube", data),
  updateAdminVideo: (videoId, data) =>
    api.put(`/admin/videos/${videoId}`, data),
  deleteAdminVideo: (videoId) => api.delete(`/admin/videos/${videoId}`),

  // Material Management
  getAdminMaterials: (params) => api.get("/admin/materials", { params }),
  uploadAdminMaterial: (formData) =>
    api.post("/admin/materials/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateAdminMaterial: (materialId, data) =>
    api.put(`/admin/materials/${materialId}`, data),
  deleteAdminMaterial: (materialId) =>
    api.delete(`/admin/materials/${materialId}`),

  // News Management
  getAdminNews: (params) => api.get("/admin/news", { params }),
  createAdminNews: (formData) =>
    api.post("/admin/news", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateAdminNews: (newsId, formData) =>
    api.put(`/admin/news/${newsId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteAdminNews: (newsId) => api.delete(`/admin/news/${newsId}`),
};
// Utility functions for API calls
export const apiUtils = {
  // Handle file uploads with progress
  uploadWithProgress: (endpoint, formData, onProgress) => {
    return api.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress,
    });
  },

  // Download files
  downloadFile: (url, filename) => {
    return api.get(url, { responseType: "blob" }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  },

  // Batch requests
  batchRequest: (requests) => {
    return Promise.allSettled(
      requests.map((req) => api.request(req).catch((error) => ({ error })))
    );
  },

  // Retry failed requests
  retryRequest: (config, maxRetries = 3) => {
    return new Promise((resolve, reject) => {
      const makeRequest = (attempt) => {
        api
          .request(config)
          .then(resolve)
          .catch((error) => {
            if (attempt < maxRetries && error.response?.status >= 500) {
              setTimeout(() => makeRequest(attempt + 1), 1000 * attempt);
            } else {
              reject(error);
            }
          });
      };
      makeRequest(1);
    });
  },
};

export default api;
