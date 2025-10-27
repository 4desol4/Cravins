
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { paymentAPI } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const PaymentSuccess = () => {
  const [status, setStatus] = useState("loading");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const ref = searchParams.get("reference");
      try {
        const res = await paymentAPI.verifyPayment(ref);
        const data = res?.data || {};
        setStatus(data?.status === "success" ? "success" : "failed");
      } catch {
        setStatus("failed");
      }
    };
    verify();
  }, [searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card p-8 text-center"
      >
        {status === "loading" && <LoadingSpinner />}
        {status === "success" && (
          <>
            <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Payment Successful
            </h2>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-primary mt-6"
            >
              Go to Dashboard
            </button>
          </>
        )}
        {status === "failed" && (
          <>
            <XMarkIcon className="w-16 h-16 mx-auto text-red-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Payment Failed
            </h2>
            <button
              onClick={() => navigate("/payments")}
              className="btn btn-outline mt-6"
            >
              Try Again
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
