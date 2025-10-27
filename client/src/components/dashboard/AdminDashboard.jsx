import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserGroupIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  NewspaperIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  CloudArrowUpIcon,
  Bars3Icon,
  ArrowPathIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { adminAPI, adminPaymentAPI, videoAPI } from "../../services/api";
import VideoUpload from "../videos/VideoUpload";
import Modal from "../common/Modal";
import toast from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";
import MaterialUpload from "../materials/MaterialUpload";

const AdminDashboard = () => {
  const { user } = useAuth();

  // Layout / UI
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [news, setNews] = useState([]);

  // Payment settings state
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    paymentsEnabled: true,
    monthlyEnabled: true,
    monthlyPrice: 2000,
    yearlyEnabled: true,
    yearlyPrice: 18000,
    lifetimeEnabled: true,
    lifetimePrice: 50000,
    freeQuestionLimit: 5,
  });

  // Payment analytics
  const [paymentStats, setPaymentStats] = useState(null);

  // Manual access modal
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantTargetUser, setGrantTargetUser] = useState(null);
  const [grantPlanType, setGrantPlanType] = useState("MONTHLY");
  const [grantDurationMonths, setGrantDurationMonths] = useState(1);
  const [grantLoading, setGrantLoading] = useState(false);

  // Modal & forms
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Controls
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null); // used across modals

  // Forms
  const [subjectForm, setSubjectForm] = useState({ name: "", description: "" });
  const [materialForm, setMaterialForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });
  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    isPublished: false,
  });

  const tabs = [
    { id: "overview", name: "Overview", icon: ChartBarIcon },
    { id: "users", name: "Users", icon: UserGroupIcon },
    { id: "videos", name: "Videos", icon: PlayCircleIcon },
    { id: "subjects", name: "Subjects", icon: AcademicCapIcon },
    { id: "materials", name: "Materials", icon: DocumentTextIcon },
    { id: "news", name: "News", icon: NewspaperIcon },
    { id: "payments", name: "Payments", icon: LockClosedIcon },
    { id: "settings", name: "Settings", icon: CogIcon },
  ];

  // Track per-tab refresh loading state
  const [tabRefreshing, setTabRefreshing] = useState(false);
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  // Initial load
  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load on tab change
  useEffect(() => {
    // Fetch only when tab changes to one that requires data
    switch (activeTab) {
      case "users":
        fetchUsers();
        break;
      case "videos":
        fetchVideos();
        break;
      case "subjects":
        fetchSubjects();
        break;
      case "materials":
        fetchMaterials();
        break;
      case "news":
        fetchNews();
        break;
      case "payments":
        fetchPaymentSettings();
        fetchPaymentStats();
        break;
      default:
        break;
    }
    // close mobile sidebar when a tab is selected
    setSidebarOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDashboardStats();
      const data = res.data?.data;

      // Map backend response to frontend state
      setDashboardStats({
        users: {
          total: data.users?.total || 0,
          paid: data.users?.paid || 0,
          free: data.users?.free || 0,
        },
        content: {
          subjects: data.content?.subjects || 0,
          questions: data.content?.questions || 0,
          videos: data.content?.videos || 0,
          materials: data.content?.materials || 0,
          news: data.content?.news || 0,
        },
        activity: {
          totalTests: data.activity?.totalTests || 0,
          weeklyTests: data.activity?.weeklyTests || 0,
          revenue: data.activity?.revenue || 0,
          successfulPayments: data.activity?.successfulPayments || 0,
        },
        recentUsers: data.recentUsers || [],
        popularSubjects: data.popularSubjects || [],
      });
    } catch (err) {
      console.error("Dashboard stats error:", err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (opts = { page: 1, limit: 50 }) => {
    try {
      const res = await adminAPI.getUsers({
        page: opts.page,
        limit: opts.limit,
      });

      const payload = res.data?.data; // This is { data: [...], pagination: {...} }

      // Correct way to access user array
      const userList = Array.isArray(payload)
        ? payload
        : payload?.data || payload?.items || [];

      setUsers(userList);

      // Store pagination info if it exists
      if (payload?.pagination) {
        setUsersPagination({
          page: payload.pagination.currentPage,
          totalPages: payload.pagination.totalPages,
          total: payload.pagination.totalItems,
        });
      }
    } catch (err) {
      console.error("fetchUsers error:", err);
      toast.error("Failed to load users");
    }
  };

  const fetchVideos = async (opts = { page: 1, limit: 100 }) => {
    try {
      const res = await adminAPI.getAdminVideos({
        page: opts.page,
        limit: opts.limit,
      });
      const payload = res.data?.data;
      setVideos(Array.isArray(payload) ? payload : payload?.data || []);
    } catch (err) {
      console.error("fetchVideos:", err);
      // fallback
      try {
        const fallback = await videoAPI.getVideos({ page: 1, limit: 100 });
        const payload = fallback.data?.data;
        setVideos(Array.isArray(payload) ? payload : payload?.data || []);
      } catch (e) {
        toast.error("Failed to load videos");
      }
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await adminAPI.getSubjects();
      setSubjects(res.data?.data || []);
    } catch (err) {
      console.error("fetchSubjects:", err);
      toast.error("Failed to load subjects");
    }
  };

  const fetchMaterials = async (opts = { page: 1, limit: 50 }) => {
    try {
      const res = await adminAPI.getAdminMaterials({
        page: opts.page,
        limit: opts.limit,
      });
      const payload = res.data?.data;
      setMaterials(Array.isArray(payload) ? payload : payload?.data || []);
    } catch (err) {
      console.error("fetchMaterials:", err);
      toast.error("Failed to load materials");
    }
  };

  const fetchNews = async (opts = { page: 1, limit: 50 }) => {
    try {
      const res = await adminAPI.getAdminNews({
        page: opts.page,
        limit: opts.limit,
      });
      const payload = res.data?.data;
      setNews(Array.isArray(payload) ? payload : payload?.data || []);
    } catch (err) {
      console.error("fetchNews:", err);
      toast.error("Failed to load news");
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      setPaymentLoading(true);
      const res = await adminPaymentAPI.getPaymentSettings();
      const s = res.data?.data;
      if (s) {
        setPaymentSettings({
          paymentsEnabled: s.paymentsEnabled ?? true,
          monthlyEnabled: s.monthlyEnabled ?? true,
          monthlyPrice: s.monthlyPrice ?? 2000,
          yearlyEnabled: s.yearlyEnabled ?? true,
          yearlyPrice: s.yearlyPrice ?? 18000,
          lifetimeEnabled: s.lifetimeEnabled ?? true,
          lifetimePrice: s.lifetimePrice ?? 50000,
          freeQuestionLimit: s.freeQuestionLimit ?? 5,
        });
      }
    } catch (err) {
      console.error("fetchPaymentSettings:", err);
      toast.error("Failed to load payment settings");
    } finally {
      setPaymentLoading(false);
    }
  };
  const fetchPaymentStats = async () => {
    try {
      const res = await adminPaymentAPI.getPaymentStats();
      setPaymentStats(res.data?.data || null);
    } catch (err) {
      console.error("fetchPaymentStats:", err);
    }
  };

  const refreshActiveTab = async () => {
    setTabRefreshing(true);
    try {
      switch (activeTab) {
        case "overview":
          await fetchDashboardData();
          break;
        case "users":
          await fetchUsers();
          break;
        case "videos":
          await fetchVideos();
          break;
        case "subjects":
          await fetchSubjects();
          break;
        case "materials":
          await fetchMaterials();
          break;
        case "news":
          await fetchNews();
          break;
        case "payments":
          await fetchPaymentSettings();
          await fetchPaymentStats();
          break;
        case "settings":
          toast.success("Settings are local UI controls");
          break;
        default:
          break;
      }
      toast.success("Refreshed");
    } catch (err) {
      console.error("refreshActiveTab:", err);
      toast.error("Refresh failed");
    } finally {
      setTimeout(() => setTabRefreshing(false), 300);
    }
  };

  //  Modal Helpers & CRUD
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);

    // prefill forms for edit flows
    if (type === "editSubject" && item)
      setSubjectForm({
        name: item.name || "",
        description: item.description || "",
      });
    if (type === "editMaterial" && item)
      setMaterialForm({
        title: item.title || "",
        description: item.description || "",
        price: item.price || "",
        category: item.category || "",
      });
    if (type === "editNews" && item)
      setNewsForm({
        title: item.title || "",
        content: item.content || "",
        excerpt: item.excerpt || "",
        category: item.category || "",
        isPublished: !!item.isPublished,
      });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setSelectedItem(null);
    setFormLoading(false);
    setSubjectForm({ name: "", description: "" });
    setMaterialForm({ title: "", description: "", price: "", category: "" });
    setNewsForm({
      title: "",
      content: "",
      excerpt: "",
      category: "",
      isPublished: false,
    });
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const confirmDelete = (type, item) => {
    setItemToDelete({ type, item });
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setFormLoading(true);

    try {
      const { type, item } = itemToDelete;

      switch (type) {
        case "user":
          await adminAPI.deleteUser(item.id);
          await fetchUsers();
          await fetchDashboardData();
          toast.success("User deleted successfully");
          break;

        case "video":
          await adminAPI.deleteAdminVideo(item.id);
          await fetchVideos();
          await fetchDashboardData();
          break;

        case "subject":
          await adminAPI.deleteSubject(item.id);
          await fetchSubjects();
          await fetchDashboardData();
          break;

        case "material":
          await adminAPI.deleteAdminMaterial(item.id);
          await fetchMaterials();
          await fetchDashboardData();
          break;

        case "news":
          await adminAPI.deleteAdminNews(item.id);
          await fetchNews();
          await fetchDashboardData();
          break;

        default:
          throw new Error("Unknown delete type");
      }

      toast.success("Deleted successfully");
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (err) {
      console.error("handleDelete:", err);
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setFormLoading(false);
    }
  };

  // Subject submit
  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (modalType === "addSubject") {
        await adminAPI.createSubject(subjectForm);
        toast.success("Subject created");
      } else {
        await adminAPI.updateSubject(selectedItem.id, subjectForm);
        toast.success("Subject updated");
      }
      await fetchSubjects();
      await fetchDashboardData();
      closeModal();
    } catch (err) {
      console.error("handleSubjectSubmit:", err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  // Material submit
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (modalType === "addMaterial") {
        const fd = new FormData();
        fd.append("title", materialForm.title);
        fd.append("description", materialForm.description || "");
        fd.append("price", materialForm.price || "0");
        fd.append("category", materialForm.category || "General");
        if (fileInputRef.current?.files?.[0])
          fd.append("file", fileInputRef.current.files[0]);
        else throw new Error("Attach a file");

        await adminAPI.uploadAdminMaterial(fd);
        toast.success("Material uploaded");
      } else {
        await adminAPI.updateAdminMaterial(selectedItem.id, materialForm);
        toast.success("Material updated");
      }
      await fetchMaterials();
      await fetchDashboardData();
      closeModal();
    } catch (err) {
      console.error("handleMaterialSubmit:", err);
      toast.error(
        err.response?.data?.message || err.message || "Operation failed"
      );
    } finally {
      setFormLoading(false);
    }
  };

  // News submit
  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", newsForm.title);
      fd.append("content", newsForm.content);
      fd.append(
        "excerpt",
        newsForm.excerpt || (newsForm.content || "").slice(0, 300)
      );
      fd.append("category", newsForm.category || "General");
      fd.append("isPublished", newsForm.isPublished ? "true" : "false");
      if (fileInputRef.current?.files?.[0])
        fd.append("image", fileInputRef.current.files[0]);

      if (modalType === "addNews") {
        await adminAPI.createAdminNews(fd);
        toast.success("News created");
      } else {
        await adminAPI.updateAdminNews(selectedItem.id, fd);
        toast.success("News updated");
      }
      await fetchNews();
      await fetchDashboardData();
      closeModal();
    } catch (err) {
      console.error("handleNewsSubmit:", err);
      toast.error(
        err.response?.data?.message || err.message || "Operation failed"
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Video operation callback
  const handleVideoOperation = async () => {
    await fetchVideos();
    await fetchDashboardData();
    closeModal();
  };

  const StatCard = ({ title, value, icon: Icon, color = "bg-primary-600" }) => (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-charcoal-900 rounded-xl p-4 sm:p-6 shadow border border-gray-200 dark:border-charcoal-800"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  // Payment settings handlers
  const updatePaymentField = (key, value) => {
    setPaymentSettings((s) => ({ ...s, [key]: value }));
  };
  const handleSavePaymentSettings = async () => {
    try {
      setPaymentSaving(true);
      const payload = {
        paymentsEnabled: paymentSettings.paymentsEnabled,
        monthlyEnabled: paymentSettings.monthlyEnabled,
        monthlyPrice: parseFloat(paymentSettings.monthlyPrice),
        yearlyEnabled: paymentSettings.yearlyEnabled,
        yearlyPrice: parseFloat(paymentSettings.yearlyPrice),
        lifetimeEnabled: paymentSettings.lifetimeEnabled,
        lifetimePrice: parseFloat(paymentSettings.lifetimePrice),
        freeQuestionLimit: parseInt(paymentSettings.freeQuestionLimit),
      };

      await adminPaymentAPI.updatePaymentSettings(payload);
      toast.success("Payment settings saved");

      // Refresh both settings and stats
      await Promise.all([fetchPaymentSettings(), fetchPaymentStats()]);
    } catch (err) {
      console.error("Save settings error:", err);
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setPaymentSaving(false);
    }
  };
  // Manual grant/revoke
  const openGrantModal = (user) => {
    setGrantTargetUser(user);
    setGrantPlanType("MONTHLY");
    setGrantDurationMonths(1);
    setShowGrantModal(true);
  };

  const closeGrantModal = () => {
    setShowGrantModal(false);
    setGrantTargetUser(null);
    setGrantLoading(false);
  };
  const handleGrantAccess = async () => {
    try {
      if (!grantTargetUser) {
        toast.error("No user selected");
        return;
      }

      const payload = {
        planType: grantPlanType,
      };

      if (grantPlanType !== "LIFETIME") {
        payload.duration = grantDurationMonths;
      }

      setGrantLoading(true);

      const res = await adminPaymentAPI.grantManualAccess(
        grantTargetUser.id,
        payload
      );

      toast.success(res.data.message || "Access granted successfully");
      closeGrantModal();
    } catch (error) {
      console.error("Grant access error:", error);
      toast.error(error.response?.data?.message || "Failed to grant access");
    } finally {
      setGrantLoading(false);
    }
  };

  const handleRevokeAccess = async (user) => {
    if (
      !window.confirm(`Revoke access for ${user.firstName} ${user.lastName}?`)
    ) {
      return;
    }

    try {
      await adminPaymentAPI.revokeUserAccess(user.id);
      toast.success("Access revoked successfully");
      await fetchUsers();
      await fetchDashboardData();
    } catch (err) {
      console.error("Revoke access error:", err);
      toast.error(err.response?.data?.message || "Failed to revoke access");
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4">
        <LoadingSpinner size="lg" text="Loading Admin Dashboard....." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="flex flex-col md:flex-row h-screen">
        {/* Sidebar (mobile collapsible) */}
        <aside
          className={`bg-white dark:bg-charcoal-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-charcoal-800 md:w-64 flex-shrink-0 z-20 transform md:translate-x-0 transition-transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } fixed md:relative inset-y-0 left-0 md:left-auto md:top-0 w-64 md:w-64`}
        >
          <div className="p-4 flex items-center justify-between md:justify-start md:flex-col md:items-start">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-white font-semibold">A</span>
              </div>
              <div>
                <h1 className="text-xl font-heading text-gray-900 dark:text-white">
                  Admin Panel
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Welcome, {user?.firstName}
                </p>
              </div>
            </div>
            <button
              className="md:hidden ml-auto p-2 rounded-md text-gray-600 dark:text-gray-300"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <nav className="px-2 pb-6 md:pb-0 md:pt-4 overflow-y-auto h-[calc(100vh-5.5rem)]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-colors mb-1 ${
                    activeTab === tab.id
                      ? "bg-primary-600 text-white shadow"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="truncate">{tab.name}</span>
                </button>
              );
            })}

            <div className="mt-4 px-2">
              <button
                onClick={async () => {
                  try {
                    await adminAPI.initializeSubjects();
                    await fetchSubjects();
                    toast.success("Subjects initialized");
                  } catch (err) {
                    console.error("initializeSubjects:", err);
                    toast.error("Initialization failed");
                  }
                }}
                className="w-full text-sm text-center font-medium py-2 rounded-md bg-gradient-to-r from-primary-600 to-primary-700 text-white"
              >
                Initialize Subjects
              </button>
            </div>
          </nav>
        </aside>

        {/*Main area */}
        <div className="flex-1 flex flex-col md:pl-0">
          {/* Topbar */}
          <header className="bg-white dark:bg-charcoal-900 border-b border-gray-200 dark:border-charcoal-800 p-4 md:p-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-heading text-gray-900 dark:text-white capitalize">
                {activeTab === "overview"
                  ? "Dashboard Overview"
                  : `${activeTab} Management`}
              </h2>

              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>•</span>
                <span className="capitalize">{activeTab}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refreshActiveTab}
                disabled={tabRefreshing}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 rounded-lg text-sm text-gray-700 dark:text-gray-200"
                title="Refresh current tab"
              >
                {tabRefreshing ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 10-8 8z"
                    />
                  </svg>
                ) : (
                  <ArrowPathIcon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {tabRefreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>

              {/* Quick actions */}
              {activeTab === "videos" && (
                <button
                  onClick={() => openModal("addVideo")}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Add Video</span>
                </button>
              )}
              {activeTab === "materials" && (
                <button
                  onClick={() => openModal("addMaterial")}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-sm"
                >
                  <CloudArrowUpIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Upload</span>
                </button>
              )}
              {activeTab === "subjects" && (
                <button
                  onClick={() => openModal("addSubject")}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Add Subject</span>
                </button>
              )}
              {activeTab === "news" && (
                <button
                  onClick={() => openModal("addNews")}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Create</span>
                </button>
              )}
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {/* Overview */}
              {activeTab === "overview" && dashboardStats && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Total Users"
                      value={
                        dashboardStats.users?.total?.toLocaleString() || "0"
                      }
                      icon={UserGroupIcon}
                      color="bg-blue-600"
                    />

                    <StatCard
                      title="Paid Users"
                      value={
                        dashboardStats.users?.paid?.toLocaleString() || "0"
                      }
                      icon={UserGroupIcon}
                      color="bg-green-600"
                    />
                    <StatCard
                      title="Total Videos"
                      value={
                        dashboardStats.content?.videos?.toLocaleString() || "0"
                      }
                      icon={PlayCircleIcon}
                      color="bg-purple-600"
                    />
                    <StatCard
                      title="Revenue"
                      value={`₦${(
                        dashboardStats.activity?.revenue || 0
                      ).toLocaleString()}`}
                      icon={ChartBarIcon}
                      color="bg-orange-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-charcoal-900 rounded-xl p-4 sm:p-6 shadow border border-gray-200 dark:border-charcoal-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Recent Users
                      </h3>
                      <div className="space-y-3">
                        {(dashboardStats.recentUsers || [])
                          .slice(0, 6)
                          .map((u) => (
                            <div key={u.id} className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                                {(u.firstName?.[0] || "") +
                                  (u.lastName?.[0] || "")}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {u.firstName} {u.lastName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {u.email}
                                </div>
                              </div>
                              <span
                                className={`ml-auto inline-flex px-2 py-1 text-xs rounded ${
                                  u.role === "ADMIN"
                                    ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                    : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                }`}
                              >
                                {u.role}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-charcoal-900 rounded-xl p-4 sm:p-6 shadow border border-gray-200 dark:border-charcoal-800">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Quick Stats
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Total Tests
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {dashboardStats.activity?.totalTests?.toLocaleString() ||
                              0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Total Questions
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {dashboardStats.content?.questions?.toLocaleString() ||
                              0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Materials
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {dashboardStats.content?.materials?.toLocaleString() ||
                              0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Users */}
              {activeTab === "users" && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      User Management
                    </h2>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-none">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search users..."
                          className="w-full sm:w-64 pl-10 pr-3 py-2 rounded-lg bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 text-sm"
                        />
                      </div>
                      <button
                        onClick={() => fetchUsers()}
                        className="px-3 py-2 bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 rounded-lg text-sm"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow border border-gray-200 dark:border-charcoal-800 overflow-auto">
                    <table className="w-full min-w-[520px]">
                      <thead className="bg-gray-50 dark:bg-charcoal-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            User
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            Role
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            Joined
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-charcoal-800">
                        {users
                          .filter((u) => {
                            if (!searchTerm) return true;
                            const s = searchTerm.toLowerCase();
                            return (
                              (u.email || "").toLowerCase().includes(s) ||
                              (u.firstName || "").toLowerCase().includes(s) ||
                              (u.lastName || "").toLowerCase().includes(s)
                            );
                          })
                          .map((u) => {
                            const hasPaid = u.hasPaid ?? false;
                            const expiry = u.paymentExpiry ?? null;
                            const isExpired =
                              expiry && new Date() > new Date(expiry);
                            return (
                              <tr
                                key={u.id}
                                className="hover:bg-gray-50 dark:hover:bg-charcoal-800/50"
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                                      {(u.firstName?.[0] || "") +
                                        (u.lastName?.[0] || "")}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {u.firstName} {u.lastName}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {u.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                      u.role === "ADMIN"
                                        ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                        : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                    }`}
                                  >
                                    {u.role}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs rounded ${
                                        hasPaid
                                          ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                      }`}
                                    >
                                      {hasPaid && !isExpired ? "Paid" : "Free"}
                                    </span>
                                    {expiry && hasPaid && !isExpired && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Expires:{" "}
                                        {new Date(expiry).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => openGrantModal(u)}
                                      className="px-2 py-1 bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 rounded text-xs"
                                    >
                                      Grant Access
                                    </button>
                                    <button
                                      onClick={() => handleRevokeAccess(u)}
                                      className="px-2 py-1 bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 rounded text-xs"
                                    >
                                      Revoke Access
                                    </button>
                                    <button
                                      onClick={() => confirmDelete("user", u)}
                                      className="p-2 rounded hover:bg-gray-50 dark:hover:bg-charcoal-800"
                                    >
                                      <TrashIcon className="w-4 h-4 text-red-600" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Videos */}
              {activeTab === "videos" && (
                <motion.div
                  key="videos"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Video Management
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal("addVideo")}
                        className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg flex items-center gap-2 text-sm"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Video</span>
                      </button>
                      <button
                        onClick={() => fetchVideos()}
                        className="px-3 py-2 bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 rounded-lg text-sm"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {videos.map((v, idx) => (
                      <motion.div
                        key={v.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="bg-white dark:bg-charcoal-900 rounded-xl overflow-hidden shadow border border-gray-200 dark:border-charcoal-800"
                      >
                        <div className="aspect-video bg-gray-200 dark:bg-charcoal-800">
                          {v.thumbnail ? (
                            <img
                              src={v.thumbnail}
                              alt={v.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PlayCircleIcon className="w-16 h-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1 line-clamp-2">
                            {v.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {v.description || "No description"}
                          </p>
                          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <EyeIcon className="w-4 h-4" />
                              <span>{v.views || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openModal("editVideo", v)}
                                className="p-2 rounded hover:bg-gray-50 dark:hover:bg-charcoal-800"
                              >
                                <PencilIcon className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => confirmDelete("video", v)}
                                className="p-2 rounded hover:bg-gray-50 dark:hover:bg-charcoal-800"
                              >
                                <TrashIcon className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Subjects */}
              {activeTab === "subjects" && (
                <motion.div
                  key="subjects"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Subject Management
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal("addSubject")}
                        className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg flex items-center gap-2 text-sm"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Subject</span>
                      </button>
                      <button
                        onClick={() => fetchSubjects()}
                        className="px-3 py-2 bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 rounded-lg text-sm"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((s, idx) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="bg-white dark:bg-charcoal-900 rounded-xl p-4 sm:p-6 shadow border border-gray-200 dark:border-charcoal-800"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {s.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                              {s.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div>
                              <button
                                onClick={() => openModal("editSubject", s)}
                                className="p-2 rounded hover:bg-gray-50 dark:hover:bg-charcoal-800"
                              >
                                <PencilIcon className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => confirmDelete("subject", s)}
                                className="p-2 rounded hover:bg-gray-50 dark:hover:bg-charcoal-800 ml-1"
                              >
                                <TrashIcon className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs rounded ${
                                s.isActive
                                  ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {s.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Materials */}
              {activeTab === "materials" && (
                <motion.div
                  key="materials"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Material Management
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal("addMaterial")}
                        className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg flex items-center gap-2 text-sm"
                      >
                        <CloudArrowUpIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Upload</span>
                      </button>
                      <button
                        onClick={() => fetchMaterials()}
                        className="px-3 py-2 bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 rounded-lg text-sm"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-charcoal-900 rounded-xl shadow border border-gray-200 dark:border-charcoal-800 overflow-auto">
                    <table className="w-full min-w-[580px]">
                      <thead className="bg-gray-50 dark:bg-charcoal-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            Material
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            Downloads
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-charcoal-800">
                        {materials.map((m) => (
                          <tr
                            key={m.id}
                            className="hover:bg-gray-50 dark:hover:bg-charcoal-800/50"
                          >
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {m.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {m.description}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              ₦{Number(m.price || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {m.downloads || 0}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openModal("editMaterial", m)}
                                  className="p-2 rounded hover:bg-gray-50 dark:hover:bg-charcoal-800"
                                >
                                  <PencilIcon className="w-4 h-4 text-blue-600" />
                                </button>
                                <button
                                  onClick={() => confirmDelete("material", m)}
                                  className="p-2 rounded hover:bg-gray-50 dark:hover:bg-charcoal-800"
                                >
                                  <TrashIcon className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* News */}
              {activeTab === "news" && (
                <motion.div
                  key="news"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      News Management
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal("addNews")}
                        className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg flex items-center gap-2 text-sm"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Create</span>
                      </button>
                      <button
                        onClick={() => fetchNews()}
                        className="px-3 py-2 bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 rounded-lg text-sm"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {news.map((a, idx) => (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="bg-white dark:bg-charcoal-900 rounded-xl overflow-hidden shadow border border-gray-200 dark:border-charcoal-800"
                      >
                        {a.image && (
                          <div className="aspect-video">
                            <img
                              src={a.image}
                              alt={a.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4 sm:p-6">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm sm:text-base">
                            {a.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                            {a.excerpt || a.content?.slice(0, 200)}
                          </p>
                          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <span>{a.views || 0} views</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openModal("editNews", a)}
                                className="p-2 rounded hover:bg-gray-50 dark:hover:bg-charcoal-800"
                              >
                                <PencilIcon className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => confirmDelete("news", a)}
                                className="p-2 rounded hover:bg-gray-50 dark:hover:bg-charcoal-800"
                              >
                                <TrashIcon className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Payments tab */}
              {activeTab === "payments" && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-charcoal-900 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Payment Settings
                    </h3>

                    {/* Global Toggle */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="font-medium">Enable Payment System</h4>
                        <p className="text-sm text-gray-500">
                          Master switch for all payments
                        </p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentSettings.paymentsEnabled}
                          onChange={(e) =>
                            updatePaymentField(
                              "paymentsEnabled",
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    {/* Monthly Plan */}
                    <div className="grid grid-cols-3 gap-4 items-center mb-4">
                      <div>
                        <h4 className="font-medium">Monthly Plan</h4>
                        <p className="text-sm text-gray-500">1 month access</p>
                      </div>
                      <div>
                        <input
                          type="number"
                          value={paymentSettings.monthlyPrice}
                          onChange={(e) =>
                            updatePaymentField(
                              "monthlyPrice",
                              Number(e.target.value)
                            )
                          }
                          className="input w-full"
                          placeholder="Price"
                        />
                      </div>
                      <div className="text-right">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={paymentSettings.monthlyEnabled}
                            onChange={(e) =>
                              updatePaymentField(
                                "monthlyEnabled",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="ml-2">Enabled</span>
                        </label>
                      </div>
                    </div>

                    {/* Yearly Plan */}
                    <div className="grid grid-cols-3 gap-4 items-center mb-4">
                      <div>
                        <h4 className="font-medium">Yearly Plan</h4>
                        <p className="text-sm text-gray-500">
                          12 months access
                        </p>
                      </div>
                      <div>
                        <input
                          type="number"
                          value={paymentSettings.yearlyPrice}
                          onChange={(e) =>
                            updatePaymentField(
                              "yearlyPrice",
                              Number(e.target.value)
                            )
                          }
                          className="input w-full"
                        />
                      </div>
                      <div className="text-right">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={paymentSettings.yearlyEnabled}
                            onChange={(e) =>
                              updatePaymentField(
                                "yearlyEnabled",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="ml-2">Enabled</span>
                        </label>
                      </div>
                    </div>

                    {/* Lifetime Plan */}
                    <div className="grid grid-cols-3 gap-4 items-center mb-4">
                      <div>
                        <h4 className="font-medium">Lifetime Plan</h4>
                        <p className="text-sm text-gray-500">
                          One-time payment
                        </p>
                      </div>
                      <div>
                        <input
                          type="number"
                          value={paymentSettings.lifetimePrice}
                          onChange={(e) =>
                            updatePaymentField(
                              "lifetimePrice",
                              Number(e.target.value)
                            )
                          }
                          className="input w-full"
                        />
                      </div>
                      <div className="text-right">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={paymentSettings.lifetimeEnabled}
                            onChange={(e) =>
                              updatePaymentField(
                                "lifetimeEnabled",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="ml-2">Enabled</span>
                        </label>
                      </div>
                    </div>

                    {/* Free Question Limit */}
                    <div className="grid grid-cols-2 gap-4 items-center mb-6">
                      <div>
                        <h4 className="font-medium">Free Question Limit</h4>
                        <p className="text-sm text-gray-500">
                          Questions free users can attempt
                        </p>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          value={paymentSettings.freeQuestionLimit}
                          onChange={(e) =>
                            updatePaymentField(
                              "freeQuestionLimit",
                              Number(e.target.value)
                            )
                          }
                          className="input w-full"
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSavePaymentSettings}
                        disabled={paymentSaving}
                        className="btn btn-primary"
                      >
                        {paymentSaving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={fetchPaymentSettings}
                        className="btn btn-outline"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  {/* Payment Statistics */}
                  {paymentStats && (
                    <div className="bg-white dark:bg-charcoal-900 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Payment Statistics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-charcoal-800 rounded-lg p-4">
                          <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Total Paid Users
                          </h4>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {paymentStats.totalPaidUsers || 0}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-charcoal-800 rounded-lg p-4">
                          <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Monthly Revenue
                          </h4>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₦
                            {(
                              paymentStats.monthlyRevenue || 0
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-charcoal-800 rounded-lg p-4">
                          <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Successful Payments
                          </h4>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {paymentStats.successfulPayments || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Settings */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-white dark:bg-charcoal-900 rounded-xl p-4 sm:p-6 shadow border border-gray-200 dark:border-charcoal-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      System Settings
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 dark:text-white">
                          Enable User Registration
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="form-checkbox h-5 w-5 text-primary-600"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 dark:text-white">
                          Enable Email Notifications
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="form-checkbox h-5 w-5 text-primary-600"
                        />
                      </div>
                      
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ---------------- Modals (Video, Subject, Material, News) ---------------- */}

      {/* Video modal (uses VideoUpload component) */}
      <Modal
        isOpen={
          showModal && (modalType === "addVideo" || modalType === "editVideo")
        }
        onClose={closeModal}
        title={modalType === "addVideo" ? "Upload Video" : "Edit Video"}
        size="lg"
        showCloseButton={false}
      >
        <VideoUpload
          editMode={modalType === "editVideo"}
          existingVideo={selectedItem}
          onVideoUploaded={handleVideoOperation}
          onClose={closeModal}
        />
      </Modal>

      {/* Subject modal */}
      <AnimatePresence>
        {showModal &&
          (modalType === "addSubject" || modalType === "editSubject") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.96 }}
                className="bg-white dark:bg-charcoal-900 rounded-xl p-4 sm:p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-charcoal-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {modalType === "addSubject"
                      ? "Add Subject"
                      : "Edit Subject"}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubjectSubmit} className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Name
                    </label>
                    <input
                      value={subjectForm.name}
                      onChange={(e) =>
                        setSubjectForm({ ...subjectForm, name: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Description
                    </label>
                    <textarea
                      value={subjectForm.description}
                      onChange={(e) =>
                        setSubjectForm({
                          ...subjectForm,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 text-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={formLoading}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm"
                    >
                      {formLoading
                        ? "Saving..."
                        : modalType === "addSubject"
                        ? "Add Subject"
                        : "Update"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Material modal */}
      <AnimatePresence>
        {showModal &&
          (modalType === "addMaterial" || modalType === "editMaterial") && (
            <Modal
              isOpen={true}
              onClose={closeModal}
              title={
                modalType === "addMaterial"
                  ? "Upload Material"
                  : "Edit Material"
              }
              size="lg"
            >
              {modalType === "addMaterial" ? (
                <MaterialUpload
                  onMaterialUploaded={() => {
                    fetchMaterials();
                    closeModal();
                  }}
                  onClose={closeModal}
                />
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="label">Title</label>
                    <input
                      type="text"
                      value={materialForm.title}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          title: e.target.value,
                        })
                      }
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      value={materialForm.description}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Price</label>
                    <input
                      type="number"
                      value={materialForm.price}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          price: e.target.value,
                        })
                      }
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <input
                      type="text"
                      value={materialForm.category}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          category: e.target.value,
                        })
                      }
                      className="input w-full"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="btn btn-outline flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleMaterialSubmit}
                      disabled={formLoading}
                      className="btn btn-primary flex-1"
                    >
                      {formLoading ? "Saving..." : "Update"}
                    </button>
                  </div>
                </div>
              )}
            </Modal>
          )}
      </AnimatePresence>

      {/* News modal */}
      <AnimatePresence>
        {showModal && (modalType === "addNews" || modalType === "editNews") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              className="bg-white dark:bg-charcoal-900 rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-charcoal-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === "addNews" ? "Create News" : "Edit News"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleNewsSubmit} className="space-y-3">
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Title
                  </label>
                  <input
                    value={newsForm.title}
                    onChange={(e) =>
                      setNewsForm({ ...newsForm, title: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Content
                  </label>
                  <textarea
                    value={newsForm.content}
                    onChange={(e) =>
                      setNewsForm({ ...newsForm, content: e.target.value })
                    }
                    rows={6}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Excerpt
                    </label>
                    <input
                      value={newsForm.excerpt}
                      onChange={(e) =>
                        setNewsForm({ ...newsForm, excerpt: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Category
                    </label>
                    <input
                      value={newsForm.category}
                      onChange={(e) =>
                        setNewsForm({ ...newsForm, category: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="publish"
                      type="checkbox"
                      checked={newsForm.isPublished}
                      onChange={(e) =>
                        setNewsForm({
                          ...newsForm,
                          isPublished: e.target.checked,
                        })
                      }
                      className="form-checkbox h-5 w-5 text-primary-600"
                    />
                    <label
                      htmlFor="publish"
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      Publish now
                    </label>
                  </div>
                </div>

                {modalType === "addNews" && (
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                      Image
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={formLoading}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm"
                  >
                    {formLoading
                      ? "Saving..."
                      : modalType === "addNews"
                      ? "Create"
                      : "Update"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              className="bg-white dark:bg-charcoal-900 rounded-xl p-4 sm:p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-charcoal-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Delete {itemToDelete?.type}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Are you sure you want to delete this {itemToDelete?.type}?
                    This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={formLoading}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={formLoading}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                    >
                      {formLoading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grant Access Modal */}
      <Modal
        isOpen={showGrantModal}
        onClose={closeGrantModal}
        title={
          grantTargetUser
            ? `Grant Access — ${grantTargetUser.email}`
            : "Grant Access"
        }
        size="md"
      >
        <div className="space-y-4">
          {/* Plan Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plan Type
            </label>
            <select
              value={grantPlanType}
              onChange={(e) => setGrantPlanType(e.target.value)}
              className="input w-full"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
              <option value="LIFETIME">Lifetime</option>
            </select>
          </div>

          {/* Duration Input (Only for Monthly/Yearly) */}
          {(grantPlanType === "MONTHLY" || grantPlanType === "YEARLY") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration ({grantPlanType === "MONTHLY" ? "months" : "years"})
              </label>
              <input
                type="number"
                min="1"
                max={grantPlanType === "MONTHLY" ? 12 : 10}
                value={grantDurationMonths}
                onChange={(e) => setGrantDurationMonths(Number(e.target.value))}
                className="input w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                {grantPlanType === "MONTHLY"
                  ? `User will get ${grantDurationMonths} month(s) of access`
                  : `User will get ${grantDurationMonths} year(s) of access`}
              </p>
            </div>
          )}

          {/* Lifetime Note */}
          {grantPlanType === "LIFETIME" && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ User will receive permanent lifetime access with no expiration
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={closeGrantModal}
              className="btn btn-outline"
              disabled={grantLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleGrantAccess}
              className="btn btn-primary"
              disabled={grantLoading}
            >
              {grantLoading ? "Granting..." : "Grant Access"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
