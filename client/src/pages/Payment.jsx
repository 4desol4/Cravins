import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  SparklesIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  BoltIcon,
  StarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { InfinityIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { paymentAPI } from "../services/api";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PricingCard from "../components/payment/PricingCard";

const Payment = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentsEnabled, setPaymentsEnabled] = useState(true);
  const [freeLimit, setFreeLimit] = useState(5);
  const [accessStatus, setAccessStatus] = useState(null);

  useEffect(() => {
    fetchPlans();
    if (user) fetchAccessStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await paymentAPI.getPaymentPlans();
      const payload = res.data?.data || {};

      const backendPlans = payload.plans || [];

      // Transform backend plans to frontend format
      const transformedPlans = backendPlans.map((plan) => ({
        type: plan.type,
        enabled: true, // If backend returns the plan, it's enabled
        price: plan.price,
        name: plan.name,
        duration: plan.duration,
        features: plan.features || [],
        recommended: plan.recommended || false,
      }));

      setPlans(transformedPlans);
      setPaymentsEnabled(payload.paymentsEnabled ?? true);
      setFreeLimit(payload.freeQuestionLimit ?? 5);
    } catch (err) {
      console.error("Fetch plans error:", err);
      toast.error("Failed to load payment plans");
      // Set defaults on error
      setPlans([]);
      setPaymentsEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessStatus = async () => {
    try {
      const res = await paymentAPI.getAccessStatus();
      setAccessStatus(res.data?.data || null);
    } catch (err) {
      console.error("Failed to fetch access status", err);
    }
  };

  const handlePayment = async (planType) => {
    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    const plan = plans.find((p) => p.type === planType);
    if (!plan || !plan.enabled) {
      toast.error("Plan unavailable");
      return;
    }

    try {
      setPaying(true);
      setSelectedPlan(planType);
      const res = await paymentAPI.initializePayment({ planType });
      const data = res.data?.data || {};
      const authorizationUrl =
        data.authorizationUrl ||
        data.authorization_url ||
        data.authorization_url;
      if (!authorizationUrl) {
        console.error("initializePayment returned:", res.data);
        toast.error("Payment init failed");
        return;
      }
      window.location.href = authorizationUrl;
    } catch (err) {
      console.error("Payment init error", err);
      toast.error(
        err.response?.data?.message || "Payment initialization failed"
      );
    } finally {
      setPaying(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-charcoal-900 dark:via-charcoal-900 dark:to-charcoal-800">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LoadingSpinner size="lg" text="Loading plans..." />
        </motion.div>
      </div>
    );
  }

  if (!paymentsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-charcoal-900 dark:via-charcoal-900 dark:to-charcoal-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl bg-white dark:bg-charcoal-800 rounded-3xl shadow-2xl p-8 sm:p-12"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <SparklesIcon className="w-20 h-20 text-primary-600 mx-auto mb-6" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Payments are currently disabled
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            The admin has disabled payments. Access control may be managed
            manually by admins.
          </p>
          <motion.a
            href="/dashboard"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Go to Dashboard <ArrowRightIcon className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    );
  }

  const userHasAccess = accessStatus?.hasPaid || false;
  const expiry = accessStatus?.paymentExpiry
    ? new Date(accessStatus.paymentExpiry)
    : null;
  const expired = expiry ? new Date() > expiry : false;

  const features = [
    {
      icon: BoltIcon,
      title: "Unlimited Practice",
      description: "Access all questions without limits",
      color: "from-blue-500 to-purple-600",
    },
    {
      icon: CheckCircleIcon,
      title: "Full Materials",
      description: "Download PDFs and study resources",
      color: "from-green-500 to-teal-600",
    },
    {
      icon: ShieldCheckIcon,
      title: "Premium Support",
      description: "Priority assistance when you need it",
      color: "from-orange-500 to-red-600",
    },
    {
      icon: StarIcon,
      title: "Exclusive Content",
      description: "Access premium courses and videos",
      color: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-charcoal-900 dark:via-charcoal-900 dark:to-charcoal-800 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Animated Background Elements */}
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <SparklesIcon className="w-12 h-12 sm:w-16 sm:h-16 text-primary-600 mx-auto" />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading mb-4 sm:mb-6 text-gray-900 dark:text-white">
            Upgrade to{" "}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Premium
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            Unlock unlimited access to all features and resources
          </p>

          {/* User Status Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-block"
          >
            {user ? (
              userHasAccess && !expired ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-300 px-6 py-3 rounded-full shadow-lg border-2 border-green-200 dark:border-green-700"
                >
                  <CheckCircleIcon className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-sm font-bold">Full Access Active</div>
                    <div className="text-xs">
                      Expires: {expiry ? expiry.toLocaleDateString() : "Never"}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-300 px-6 py-3 rounded-full shadow-lg border-2 border-yellow-200 dark:border-yellow-700"
                >
                  <LockClosedIcon className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-sm font-bold">
                      {expired ? "Access Expired" : "Free User"}
                    </div>
                    <div className="text-xs">
                      {expired
                        ? "Renew to restore access"
                        : `Limited to ${freeLimit} questions`}
                    </div>
                  </div>
                </motion.div>
              )
            ) : (
              <motion.a
                href="/login"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-charcoal-800 text-gray-900 dark:text-white rounded-full font-semibold shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all"
              >
                Login to purchase
                <ArrowRightIcon className="w-4 h-4" />
              </motion.a>
            )}
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-16 sm:mb-20"
        >
          {plans.map((plan, index) => {
            const isYearly = plan.type === "YEARLY";
            const isLifetime = plan.type === "LIFETIME";
            const planConfig = {
              title:
                plan.type === "MONTHLY"
                  ? "Monthly"
                  : plan.type === "YEARLY"
                  ? "Yearly"
                  : "Lifetime",
              months:
                plan.type === "MONTHLY" ? 1 : plan.type === "YEARLY" ? 12 : "∞",
              priceLabel: `₦${Number(plan.price).toLocaleString()}`,
              perks:
                plan.type === "MONTHLY"
                  ? [
                      "Full access for 1 month",
                      "Unlimited questions",
                      "Download materials",
                      "Email support",
                    ]
                  : plan.type === "YEARLY"
                  ? [
                      "Full access for 12 months",
                      "Save 25% vs monthly",
                      "Unlimited questions",
                      "Download materials",
                      "Priority support",
                      "Exclusive content",
                    ]
                  : [
                      "Lifetime access - forever",
                      "One-time payment",
                      "Unlimited questions",
                      "Download materials",
                      "VIP support",
                      "All future updates",
                    ],
              highlighted: isYearly,
              disabled: !plan.enabled,
              icon:
                plan.type === "MONTHLY"
                  ? ClockIcon
                  : plan.type === "YEARLY"
                  ? StarIcon
                  : InfinityIcon,
            };

            return (
              <motion.div key={plan.type} variants={itemVariants}>
                <PricingCard
                  plan={planConfig}
                  onChoose={() => handlePayment(plan.type)}
                  highlighted={isYearly}
                  paying={paying && selectedPlan === plan.type}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 sm:mb-20"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900 dark:text-white">
            What You'll Get
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800"
              >
                <motion.div
                  className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${feature.color} rounded-xl mb-4`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* FAQ / Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-charcoal-800 rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
            Frequently Asked Questions
          </h3>

          <div className="space-y-6">
            <motion.div
              whileHover={{ x: 5 }}
              className="border-l-4 border-primary-500 pl-4"
            >
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                What happens to free users?
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Free users can answer up to {freeLimit} questions and access
                basic features. Upgrade to unlock unlimited questions and
                download PDFs/materials.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ x: 5 }}
              className="border-l-4 border-secondary-500 pl-4"
            >
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                Can I upgrade or downgrade later?
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! You can upgrade to a longer plan at any time. Contact
                support for assistance.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ x: 5 }}
              className="border-l-4 border-primary-500 pl-4"
            >
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                Is my payment secure?
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Absolutely! We use Paystack, a trusted payment gateway, to
                process all transactions securely.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ x: 5 }}
              className="border-l-4 border-secondary-500 pl-4"
            >
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                What if I'm not satisfied?
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                We offer a satisfaction guarantee. Contact our support team
                within 7 days for assistance.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16 sm:mt-20"
        >
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Still have questions? We're here to help!
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Contact Support
            <ArrowRightIcon className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;
