import React, { useState } from "react";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { paymentAPI } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const PaymentModal = ({ open = false, onClose = () => {}, plan = null }) => {
  const { user } = useAuth();
  const { setLoading } = useApp();
  const [loading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

 const handlePay = async () => {
  if (!user) {
    toast.error("Please login to continue");
    navigate("/login");
    return;
  }

  try {
    setLocalLoading(true);
    setLoading?.(true);

    // FIXED: Use correct API and payload structure
    const payload = { planType: plan.type };
    const res = await paymentAPI.initializePayment(payload);

    const data = res?.data?.data || res?.data || {};
    const url = data.authorizationUrl || data.authorization_url;
    
    if (!url) {
      throw new Error("Payment URL not found in response");
    }

    window.location.href = url;
  } catch (err) {
    console.error("Payment error:", err.response?.data || err);
    toast.error(err.response?.data?.message || "Payment failed");
  } finally {
    setLocalLoading(false);
    setLoading?.(false);
  }
};
  if (!open || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white dark:bg-black rounded-xl shadow-2xl w-full max-w-md p-6 z-10"
      >
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Confirm {plan.title}
          </h4>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 dark:bg-charcoal-900 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Price
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ₦{Number(plan.price).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Duration
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {plan.duration}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          You'll be redirected to complete your payment securely.
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button
            onClick={handlePay}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">Processing...</span>
              </>
            ) : (
              "Proceed to Pay"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
