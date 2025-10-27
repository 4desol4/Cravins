const express = require("express");
const router = express.Router();
const {
  getNews,
  getNewsArticle,
  getLatestNews,
  createNews,
  updateNews,
  deleteNews,
  getPendingExternalNews,
  approveExternalNews,
  getNewsStats,
} = require("../controllers/newsController");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/roleCheck");
const { uploadImage } = require("../middleware/upload");
const { validateNews } = require("../middleware/validation");

// Public routes
router.get("/stats", getNewsStats);
router.get("/latest", getLatestNews);
router.get("/", getNews);
router.get("/:newsId", optionalAuth, getNewsArticle);

// Admin routes
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  uploadImage.single("image"),
  validateNews,
  createNews
);
router.put(
  "/:newsId",
  authenticateToken,
  requireAdmin,
  uploadImage.single("image"),
  updateNews
);
router.delete("/:newsId", authenticateToken, requireAdmin, deleteNews);
router.get(
  "/admin/pending-external",
  authenticateToken,
  requireAdmin,
  getPendingExternalNews
);
router.post(
  "/admin/approve-external",
  authenticateToken,
  requireAdmin,
  approveExternalNews
);

module.exports = router;
