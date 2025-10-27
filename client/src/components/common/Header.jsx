import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navigationLinks = [
    { name: "Home", href: "/", public: true },
    { name: "Practice", href: "/practice", public: false },
    { name: "Videos", href: "/videos", public: false },
    { name: "Materials", href: "/materials", public: false },
    { name: "Chatbot", href: "/chatbot", public: false },
    { name: "News", href: "/news", public: true },
    { name: "Payment", href: "/payments", public: true },
    { name: "About", href: "/about", public: true },
    { name: "Contact", href: "/contact", public: true },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowProfileMenu(false);
    setIsOpen(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

 
  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-menu")) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-lg shadow-md"
          : "bg-white dark:bg-charcoal-900"
      } border-b border-gray-200 dark:border-gray-800`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
          {/* Logo - Responsive sizing */}
          <Link
            to="/"
            className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0"
          >
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg sm:rounded-xl shadow-lg">
              <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-2xl sm:text-3xl lg:text-4xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-fontTwo font-bold">
              Cravins
            </span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navigationLinks.map((link) => {
              if (!link.public && !isAuthenticated) return null;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`relative px-2 xl:px-4 py-2 text-sm    transition-colors rounded-lg ${
                    isActive(link.href)
                      ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-charcoal-800"
                  }`}
                >
                  {link.name}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-primary-600 dark:bg-primary-400"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <SunIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Profile Menu - Desktop/Tablet */}
                <div className="relative profile-menu hidden sm:block">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-1.5 sm:space-x-2 p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800"
                      />
                    ) : (
                      <UserCircleIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                    )}
                    <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
                      {user?.firstName}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-charcoal-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          to="/dashboard"
                          className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-charcoal-700 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Dashboard
                        </Link>

                        {/* <Link
                          to="/profile"
                          className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-charcoal-700 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Profile Settings
                        </Link> */}

                        <div className="border-t border-gray-100 dark:border-gray-700 mt-1"></div>

                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Icon - Mobile only */}
                <Link
                  to="/dashboard"
                  className="sm:hidden p-1.5 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="w-6 h-6 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800"
                    />
                  ) : (
                    <UserCircleIcon className="w-6 h-6" />
                  )}
                </Link>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
                <Link
                  to="/login"
                  className="text-sm lg:text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-2 lg:px-3 py-1.5 lg:py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 text-sm lg:text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              ) : (
                <Bars3Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu-wrapper"
            className="fixed inset-0 z-[999] lg:hidden flex justify-end"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-[85%] sm:w-[400px] max-w-full bg-white dark:bg-charcoal-900 shadow-2xl overflow-y-auto h-full"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl sm:text-3xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-fontTwo font-bold">
                    Cravins
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* User Profile Section */}
              {isAuthenticated && (
                <div className="p-4 sm:p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-4 ring-white dark:ring-charcoal-800"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {user?.firstName?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="p-4 sm:p-6 space-y-1">
                {navigationLinks.map((link) => {
                  if (!link.public && !isAuthenticated) return null;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-base sm:text-lg font-medium rounded-xl transition-all ${
                        isActive(link.href)
                          ? "text-primary-600 dark:text-primary-400 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 shadow-sm"
                          : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-charcoal-800"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}

                {/* Auth Actions for Mobile */}
                {!isAuthenticated && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 mt-4">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-base sm:text-lg font-medium text-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-charcoal-800 rounded-xl transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-base sm:text-lg font-semibold text-center text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                {/* Authenticated User Actions */}
                {isAuthenticated && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1 mt-4">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-charcoal-700 rounded-xl transition-all"
                    >
                      Dashboard
                    </Link>
                    {/* <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-charcoal-700 rounded-xl transition-all"
                    >
                      Profile Settings
                    </Link> */}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-base sm:text-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
