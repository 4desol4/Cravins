import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { materialAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import MaterialCard from "./MaterialCard";
import LoadingSpinner from "../common/LoadingSpinner";
import { useDebounce } from "../../hooks/useDebounce";
import toast from "react-hot-toast";

const MaterialsList = ({ accessStatus, onMaterialUpdate }) => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const categories = [
    { id: "", name: "All Categories" },
    { id: "General", name: "General" },
    { id: "Mathematics", name: "Mathematics" },
    { id: "Science", name: "Science" },
    { id: "English", name: "English" },
    { id: "Past Questions", name: "Past Questions" },
    { id: "Study Guides", name: "Study Guides" },
  ];

  useEffect(() => {
    fetchMaterials();
  }, [page, debouncedSearchTerm, selectedCategory, sortBy]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        search: debouncedSearchTerm,
        category: selectedCategory || undefined,
        sortBy,
      };

      const response = await materialAPI.getMaterials(params);
      const responseData = response.data?.data || response.data;

      // Handle proper response structure
      let materialsData = [];
      let totalCount = 0;

      if (responseData.data && Array.isArray(responseData.data)) {
        materialsData = responseData.data;
        totalCount = responseData.pagination?.totalItems || materialsData.length;
      } else if (Array.isArray(responseData)) {
        materialsData = responseData;
        totalCount = materialsData.length;
      }

      setMaterials(materialsData);
      setTotalPages(Math.ceil(totalCount / 12));
    } catch (error) {
      console.error("Fetch materials error:", error.response?.data || error);
      toast.error("Failed to load materials");
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSuccess = (material) => {
    // Refresh materials or update stats
    if (onMaterialUpdate) {
      onMaterialUpdate();
    }
  };

  if (loading && materials.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading materials..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <TagIcon className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Downloaded</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </motion.div>

      {materials.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Materials Found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search criteria or check back later for new
            materials
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material, index) => (
            <MaterialCard
              key={material.id}
              material={material}
              accessStatus={accessStatus}
              onDownloadSuccess={handleDownloadSuccess}
              index={index}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-2"
        >
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn btn-outline btn-sm"
          >
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="btn btn-outline btn-sm"
          >
            Next
          </button>
        </motion.div>
      )}

      {loading && (
        <div className="flex justify-center">
          <LoadingSpinner size="md" text="Loading more materials..." />
        </div>
      )}
    </div>
  );
};

export default MaterialsList;