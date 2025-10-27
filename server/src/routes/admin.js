const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  initializeSubjects,
  getAnalytics,
  uploadVideo,
  uploadMaterial,
  createNews,
  updateNews,
  deleteNews,
  deleteVideo,
  deleteMaterial,
  getAdminVideos,
  getAdminMaterials,
  getAdminNews,
  updateVideo,
  updateMaterial,
  getSubjects,
  updateSubject,
  createSubject,
  deleteSubject,
  deleteUser,
} = require("../controllers/adminController");

const {
  getPaymentSettings,
  updatePaymentSettings,
  togglePaymentSystem,
  getPaymentStats,
  grantManualAccess,
  revokeUserAccess,
} = require("../controllers/adminPaymentController");

const { authenticateToken } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/roleCheck");
const {
  uploadDocument,
  uploadImage,
  uploadVideo: videoUpload,
} = require("../middleware/upload");

router.use(authenticateToken, requireAdmin);

// Dashboard
router.get("/dashboard", getDashboardStats);
router.get("/analytics", getAnalytics);

// User Management
router.get("/users", getUsers);
router.put("/users/:userId/status", updateUserStatus);
router.delete('/users/:userId', deleteUser);

// Payment Settings Management
router.get("/payment-settings", getPaymentSettings);
router.put("/payment-settings", updatePaymentSettings);
router.post("/payment-settings/toggle", togglePaymentSystem);
router.get("/payment-stats", getPaymentStats);
router.post("/users/:userId/grant-access", grantManualAccess);
router.delete("/users/:userId/revoke-access", revokeUserAccess);

// Subject Management
router.get("/subjects", getSubjects);
router.post("/subjects", createSubject);
router.put("/subjects/:subjectId", updateSubject);
router.delete("/subjects/:subjectId", deleteSubject);
router.post("/subjects/initialize", initializeSubjects);

// Video Management
router.post("/videos/upload", videoUpload.single("video"), uploadVideo);
router.post("/videos/youtube", (req, res, next) => {
  req.body.isYouTube = true;
  uploadVideo(req, res, next);
});
router.delete("/videos/:videoId", deleteVideo);
router.put("/videos/:videoId", updateVideo);
router.get("/videos", getAdminVideos);

// Material Management
router.post("/materials/upload", uploadDocument.single("file"), uploadMaterial);
router.delete("/materials/:materialId", deleteMaterial);
router.get("/materials", getAdminMaterials);
router.put("/materials/:materialId", updateMaterial);

// News Management
router.post("/news", uploadImage.single("image"), createNews);
router.put("/news/:newsId", uploadImage.single("image"), updateNews);
router.delete("/news/:newsId", deleteNews);
router.get("/news", getAdminNews);

module.exports = router;