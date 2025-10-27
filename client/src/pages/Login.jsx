import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, GraduationCap } from "lucide-react";
import { EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.persist?.();
    if (!validateForm()) return;

    try {
      const result = await login(formData);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrors((prev) => ({
          ...prev,
          general: result.message || "Invalid email or password",
        }));
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: "An unexpected error occurred. Please try again.",
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-charcoal-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">Cravins</span>
            </Link>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Login Form */}
          <div className="card p-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              noValidate
              className="space-y-6"
              autoComplete="off"
            >
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`input ${errors.email ? "input-error" : ""}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={`input pr-12 ${
                      errors.password ? "input-error" : ""
                    }`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="error-text">{errors.password}</p>
                )}
              </div>

              {/* General Login Error */}
              {errors.general && (
                <p className="text-center text-red-500 text-sm mt-2">
                  {errors.general}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full btn-lg"
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider"></div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
