import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  CreditCardIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const PricingCard = ({
  plan = {},
  onChoose = () => {},
  highlighted = false,
  paying = false,
}) => {
  const {
    title,
    months,
    priceLabel,
    perks = [],
    disabled = false,
    icon: Icon = StarIcon,
  } = plan;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        scale: highlighted ? 1.05 : 1.03,
        y: -10,
        transition: { type: "spring", stiffness: 300 },
      }}
      className={`relative p-6 sm:p-8 flex flex-col justify-between w-full max-w-sm mx-auto rounded-2xl sm:rounded-3xl border-2 shadow-xl transition-all duration-300 group overflow-hidden ${
        highlighted
          ? "border-primary-500 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-charcoal-800 dark:to-secondary-900/20 shadow-2xl"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-charcoal-800 hover:border-primary-300 dark:hover:border-primary-700"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {/* Popular Badge */}
      {highlighted && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute top-4 right-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
        >
          <SparklesIcon className="w-3 h-3" />
          BEST VALUE
        </motion.div>
      )}

      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all duration-500 rounded-2xl sm:rounded-3xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
        animate={{
          translateX: ["100%", "100%", "-100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "linear",
        }}
      />

      <div className="relative z-10">
        {/* Icon & Title */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${
              highlighted
                ? "bg-gradient-to-r from-primary-600 to-secondary-600"
                : "bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800"
            } shadow-lg`}
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </motion.div>

          {months === "∞" && (
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="text-primary-600 dark:text-primary-400"
            >
              <SparklesIcon className="w-6 h-6" />
            </motion.div>
          )}
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* Price */}
        <div className="mb-6">
          <motion.div
            className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            {priceLabel}
          </motion.div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {months === "∞"
              ? "One-time payment"
              : `per ${months === 1 ? "month" : "year"}`}
          </span>
        </div>

        {/* Perks List */}
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.3,
              },
            },
          }}
          className="space-y-3 mb-8"
        >
          {perks.map((perk, i) => (
            <motion.li
              key={i}
              variants={{
                hidden: { opacity: 0, x: -10 },
                visible: { opacity: 1, x: 0 },
              }}
              className="flex items-start gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              </motion.div>
              <span>{perk}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* CTA Button */}
      <motion.button
        onClick={() => !disabled && !paying && onChoose(plan)}
        disabled={disabled || paying}
        whileHover={!disabled && !paying ? { scale: 1.05 } : {}}
        whileTap={!disabled && !paying ? { scale: 0.95 } : {}}
        className={`relative w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl z-10 overflow-hidden ${
          disabled
            ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            : highlighted
            ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700"
            : "bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-600 dark:to-gray-700 text-white hover:from-gray-800 hover:to-gray-900"
        }`}
      >
        {/* Button shine effect */}
        {!disabled && !paying && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "linear",
            }}
          />
        )}

        <div className="relative flex items-center justify-center gap-2">
          {paying ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Processing...</span>
            </>
          ) : disabled ? (
            <>
              <span>Plan Disabled</span>
            </>
          ) : (
            <>
              <CreditCardIcon className="w-5 h-5" />
              <span>Choose Plan</span>
            </>
          )}
        </div>
      </motion.button>

      {/* Decorative Elements */}
      {highlighted && (
        <>
          <motion.div
            className="absolute -bottom-2 -right-2 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -top-2 -left-2 w-20 h-20 bg-secondary-500/20 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </>
      )}
    </motion.div>
  );
};

export default PricingCard;
