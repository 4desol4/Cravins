import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  EyeIcon,
  GraduationCap,
  CheckCircleIcon,
} from "lucide-react";
import { EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const { register, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) return;

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
    });

    if (result.success) {
      navigate("/dashboard", { replace: true });
    }
  };

  const benefits = [
    "Access to 500+ practice questions",
    "HD video lessons from expert instructors",
    "AI-powered personalized tutoring",
    "Comprehensive study materials",
    "Progress tracking and analytics",
    "Mobile-friendly platform",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-charcoal-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block"
          >
            <div className="card p-8 h-full bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
              <h2 className="text-3xl font-bold mb-6">Join Cravins Today</h2>
              <p className="text-lg mb-8 opacity-90">
                Transform your academic journey with our comprehensive
                e-learning platform designed for Nigerian students.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/20">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">10K+</div>
                    <div className="text-sm opacity-75">Students</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-sm opacity-75">Questions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">95%</div>
                    <div className="text-sm opacity-75">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Signup Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">
                  Cravins
                </span>
              </Link>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create your account
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Start your journey to academic excellence
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= 1
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  1
                </div>
                <div
                  className={`h-1 w-16 ${
                    currentStep >= 2 ? "bg-primary-600" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= 2
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  2
                </div>
              </div>
            </div>

            <div className="card p-8">
              {currentStep === 1 ? (
                <form onSubmit={handleNextStep} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="label">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        className={`input ${
                          errors.firstName ? "input-error" : ""
                        }`}
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                      {errors.firstName && (
                        <p className="error-text">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="label">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        className={`input ${
                          errors.lastName ? "input-error" : ""
                        }`}
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                      {errors.lastName && (
                        <p className="error-text">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

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
                    {errors.email && (
                      <p className="error-text">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="label">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="input"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="dateOfBirth" className="label">
                      Date of Birth (Optional)
                    </label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      className="input"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full btn-lg"
                  >
                    Continue
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={`input pr-12 ${
                        errors.password ? "input-error" : ""
                      }`}
                      placeholder="Create a password"
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
                  <div>
                    <label htmlFor="confirmPassword" className="label">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={`input pr-12 ${
                          errors.confirmPassword ? "input-error" : ""
                        }`}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="error-text">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-primary-600 hover:underline"
                      >
                        terms and conditions
                      </Link>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="error-text">{errors.agreeToTerms}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="btn btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Already have account */}
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              <Link to="/login" className="text-primary-600 hover:underline">
                Log in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
