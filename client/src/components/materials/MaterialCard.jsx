import { useState } from "react";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  LockClosedIcon,
  CheckCircleIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { materialAPI } from "../../services/api";
import toast from "react-hot-toast";

const MaterialCard = ({
  material,
  accessStatus,
  onDownloadSuccess,
  index = 0,
}) => {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const getFileIcon = (fileType) => {
    const icons = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      ppt: "📋",
      pptx: "📋",
    };
    return icons[fileType] || "📄";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await materialAPI.downloadMaterial(material.id);
      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = material.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  // Check access
  const userHasAccess =
    user?.role === "ADMIN" || user?.hasPaid || accessStatus?.hasAccess;
  const paymentsEnabled = accessStatus?.paymentsEnabled !== false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card-hover group overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">{getFileIcon(material.fileType)}</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors">
                {material.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase">
                  {material.fileType}
                </span>
                <span className="text-xs text-gray-500">
                  {formatFileSize(material.fileSize)}
                </span>
              </div>
            </div>
          </div>

          {!userHasAccess && paymentsEnabled && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <LockClosedIcon className="w-5 h-5" />
            </div>
          )}

          {userHasAccess && (
            <div className="flex items-center space-x-1 text-success-600">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="text-xs font-medium">Access</span>
            </div>
          )}
        </div>

        {material.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
            {material.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>{material.downloads || 0} downloads</span>
          </div>

          {material.category && (
            <div className="flex items-center space-x-1">
              <TagIcon className="w-4 h-4" />
              <span>{material.category}</span>
            </div>
          )}
        </div>

        {/* Action Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          {userHasAccess ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn btn-success w-full flex items-center justify-center space-x-2"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download</span>
                </>
              )}
            </button>
          ) : paymentsEnabled ? (
            <a
              href="/payments"
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              <LockClosedIcon className="w-4 h-4" />
              <span>Get Access</span>
            </a>
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn btn-success w-full flex items-center justify-center space-x-2"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download Free</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MaterialCard;
