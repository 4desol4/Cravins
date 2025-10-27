const express = require('express');
const router = express.Router();
const {
  getMaterials,
  getMaterial,
  downloadMaterial,
  getDownloadedMaterials,
  uploadMaterial,
  updateMaterial,
  deleteMaterial
} = require('../controllers/pdfController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { uploadDocument } = require('../middleware/upload');
const { validateMaterial } = require('../middleware/validation');

//  Downloaded list (before :id)
router.get('/downloaded', authenticateToken, getDownloadedMaterials);

//  Download route (before :id)
router.get('/download/:materialId', authenticateToken, downloadMaterial);

//  Normal routes
router.get('/', optionalAuth, getMaterials);
router.get('/:materialId', optionalAuth, getMaterial);

//  Admin routes
router.post(
  '/upload',
  authenticateToken,
  requireAdmin,
  uploadDocument.single('file'),
  validateMaterial,
  uploadMaterial
);
router.put('/:materialId', authenticateToken, requireAdmin, updateMaterial);
router.delete('/:materialId', authenticateToken, requireAdmin, deleteMaterial);

module.exports = router;
