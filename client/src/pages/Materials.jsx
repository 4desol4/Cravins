import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DocumentTextIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ShoppingBagIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MaterialsList from "../components/materials/MaterialsList";
import MaterialUpload from "../components/materials/MaterialUpload";
import Modal from "../components/common/Modal";
import { materialAPI, paymentAPI } from "../services/api";
import toast from "react-hot-toast";

const Materials = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState("list");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [downloadedMaterials, setDownloadedMaterials] = useState([]);
  const [loadingDownloaded, setLoadingDownloaded] = useState(false);
  const [accessStatus, setAccessStatus] = useState(null);
  const [materialStats, setMaterialStats] = useState({
    totalMaterials: 0,
    downloadedCount: 0,
    totalDownloads: 0,
  });

  useEffect(() => {
    fetchMaterialStats();
    if (user) {
      fetchAccessStatus();
      fetchDownloadedMaterials();
    }
  }, [user]);

  const fetchAccessStatus = async () => {
    try {
      const response = await paymentAPI.getAccessStatus();
      setAccessStatus(response.data.data);
    } catch (error) {
      console.error("Failed to fetch access status:", error);
    }
  };

  const fetchMaterialStats = async () => {
    try {
      const response = await materialAPI.getMaterials({ page: 1, limit: 1000 });
      const responseData = response.data?.data || response.data;

      let materials = [];
      let totalCount = 0;

      if (responseData.data && Array.isArray(responseData.data)) {
        materials = responseData.data;
        totalCount = responseData.pagination?.totalItems || materials.length;
      } else if (Array.isArray(responseData)) {
        materials = responseData;
        totalCount = materials.length;
      }

      const totalDownloads = materials.reduce(
        (acc, mat) => acc + (mat.downloads || 0),
        0
      );

      let downloadedCount = 0;
      if (user && (user.role === "ADMIN" || user.hasPaid)) {
        try {
          const downloadedRes = await materialAPI.getDownloadedMaterials();
          const downloadedData = downloadedRes.data.data;
          downloadedCount =
            downloadedData.pagination?.totalItems ||
            (Array.isArray(downloadedData.data)
              ? downloadedData.data.length
              : 0);
        } catch (error) {
          console.error("Failed to fetch downloaded count:", error);
        }
      }

      setMaterialStats({
        totalMaterials: totalCount,
        downloadedCount,
        totalDownloads,
      });
    } catch (error) {
      console.error("Failed to fetch material stats:", error);
    }
  };

  const fetchDownloadedMaterials = async () => {
    if (!user) return;

    // Only fetch if user has paid access
    const hasAccess = user.role === "ADMIN" || user.hasPaid;
    if (!hasAccess) return;

    try {
      setLoadingDownloaded(true);
      const response = await materialAPI.getDownloadedMaterials();
      const data = response.data.data;
      setDownloadedMaterials(
        Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error("Failed to fetch downloaded materials:", error);
      setDownloadedMaterials([]);
    } finally {
      setLoadingDownloaded(false);
    }
  };

  const handleMaterialUpload = () => {
    setShowUploadModal(false);
    fetchMaterialStats();
    toast.success("Material uploaded successfully!");
  };
  const handleDownload = async (download) => {
    try {
      const response = await materialAPI.downloadMaterial(download.material.id);
      const data = response.data?.data || response.data;

      if (data.downloadUrl) {
        // Open the signed S3 URL to trigger download
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.fileName || download.material.fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Download started!");
      } else {
        throw new Error("Download URL not received");
      }
    } catch (error) {
      console.error("Download error:", error);
      const message = error.response?.data?.message || "Download failed";
      toast.error(message);
    }
  };

  const renderHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading text-gray-900 dark:text-white mb-1 sm:mb-2">
            Study Materials
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Access comprehensive study materials and downloadable resources
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 items-center">
          {/* Admin Add Material Button */}
          {user?.role === "ADMIN" && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 text-sm sm:text-base flex-shrink-0"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Material</span>
            </button>
          )}

          {/* View Toggle */}
          {user && (user.role === "ADMIN" || user.hasPaid) && (
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm sm:text-base flex-shrink">
              <button
                onClick={() => setCurrentView("list")}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 font-medium transition-colors ${
                  currentView === "list"
                    ? "bg-primary-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                All Materials
              </button>
              <button
                onClick={() => setCurrentView("downloaded")}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 font-medium transition-colors ${
                  currentView === "downloaded"
                    ? "bg-primary-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Downloaded ({materialStats.downloadedCount})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {[
          {
            icon: <DocumentTextIcon className="w-6 h-6 text-blue-600" />,
            value: materialStats.totalMaterials,
            label: "Total Materials",
            bg: "bg-blue-100",
          },
          {
            icon: <CheckCircleIcon className="w-6 h-6 text-success-600" />,
            value: materialStats.downloadedCount,
            label: "My Downloads",
            bg: "bg-success-100",
          },
          {
            icon: <ArrowDownTrayIcon className="w-6 h-6 text-purple-600" />,
            value: materialStats.totalDownloads.toLocaleString(),
            label: "Total Downloads",
            bg: "bg-purple-100",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            className="card p-4 text-center"
          >
            <div
              className={`flex items-center justify-center w-12 h-12 ${stat.bg} rounded-full mb-3 mx-auto`}
            >
              {stat.icon}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderDownloadedMaterials = () => (
    <motion.div
      key="downloaded"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {loadingDownloaded ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : downloadedMaterials.length === 0 ? (
        <div className="card p-12 text-center">
          <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Materials Downloaded Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Start building your study library by downloading materials
          </p>
          <button
            onClick={() => setCurrentView("list")}
            className="btn btn-primary"
          >
            Browse Materials
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloadedMaterials.map((download, index) => (
            <motion.div
              key={download.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-hover group overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">
                      {download.material.fileType === "pdf"
                        ? "📄"
                        : download.material.fileType.includes("doc")
                        ? "📝"
                        : download.material.fileType.includes("xls")
                        ? "📊"
                        : "📋"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {download.material.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase">
                          {download.material.fileType}
                        </span>
                        <span className="text-xs text-gray-500">
                          Downloaded{" "}
                          {new Date(download.downloadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {download.material.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                    {download.material.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500">
                    {download.material.category}
                  </div>

                  <button
                    onClick={() => handleDownload(download)}
                    className="btn btn-success btn-sm flex items-center space-x-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  // Check if user has paid access
  const userHasAccess = user?.role === "ADMIN" || user?.hasPaid;
  const paymentsEnabled = accessStatus?.paymentsEnabled !== false;

  return (
    <div className="min-h-screen bg-gradient-to-br relative from-slate-50 to-blue-50 dark:from-charcoal-900 dark:to-charcoal-800 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      <div className="container-max section-padding">
        {renderHeader()}

        {/* Access Warning for Non-Paid Users */}
        {user && !userHasAccess && paymentsEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl"
          >
            <div className="flex items-start gap-4">
              <LockClosedIcon className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Payment Required
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
                  You need to complete payment to download study materials. Get
                  unlimited access to all resources!
                </p>
                <Link
                  to="/payments"
                  className="btn btn-primary btn-sm inline-flex items-center gap-2"
                >
                  View Plans
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {currentView === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MaterialsList
                accessStatus={accessStatus}
                onMaterialUpdate={fetchMaterialStats}
              />
            </motion.div>
          )}

          {currentView === "downloaded" && renderDownloadedMaterials()}
        </AnimatePresence>

        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title=""
          size="lg"
          showCloseButton={false}
        >
          <MaterialUpload
            onMaterialUploaded={handleMaterialUpload}
            onClose={() => setShowUploadModal(false)}
          />
        </Modal>

        {/* Free Access Notice */}
        {!paymentsEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 card p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-center"
          >
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Free Access Enabled!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              All materials are currently available for free. Download and
              access any resource without restrictions!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Materials;
