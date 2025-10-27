import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  BookOpenIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  UserGroupIcon,
  TrophyIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    students: "10K+",
    courses: "500+",
    successRate: "95%",
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const iconFloatVariants = {
    animate: {
      y: [0, -10, 0],
      rotate: [0, 5, 0, -5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const features = [
    {
      icon: BookOpenIcon,
      title: "Practice Questions",
      description:
        "Test your knowledge with interactive quizzes and challenges",
      color: "from-blue-500 to-purple-600",
      href: "/practice",
      gradient: "bg-gradient-to-br from-blue-500/10 to-purple-600/10",
    },
    {
      icon: PlayCircleIcon,
      title: "Video Classes",
      description: "Learn from expert instructors with HD video content",
      color: "from-green-500 to-teal-600",
      href: "/videos",
      gradient: "bg-gradient-to-br from-green-500/10 to-teal-600/10",
    },
    {
      icon: DocumentTextIcon,
      title: "Get PDFs",
      description:
        "Access comprehensive study materials and downloadable resources",
      color: "from-purple-500 to-pink-600",
      href: "/materials",
      gradient: "bg-gradient-to-br from-purple-500/10 to-pink-600/10",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "AI Study Bot",
      description: "Get personalized help from our intelligent tutoring system",
      color: "from-orange-500 to-red-600",
      href: "/chatbot",
      gradient: "bg-gradient-to-br from-orange-500/10 to-red-600/10",
    },
  ];

  const testimonials = [
    {
      name: "Adebayo Johnson",
      role: "JAMB Candidate 2023",
      image: "/testimonials/student1.jpg",
      content:
        "Cravins helped me score 315 in JAMB! The practice questions were exactly like the real exam.",
      rating: 5,
    },
    {
      name: "Fatima Hassan",
      role: "WAEC Graduate",
      image: "/testimonials/student2.jpg",
      content:
        "The video lessons made complex topics so easy to understand. I got A1s in all my subjects!",
      rating: 5,
    },
    {
      name: "Chukwu Emmanuel",
      role: "University Student",
      image: "/testimonials/student3.jpg",
      content:
        "The AI tutor is amazing! It answered all my questions and helped me prepare for POST-UTME.",
      rating: 5,
    },
  ];

  const examTypes = [
    {
      name: "JAMB",
      description: "Joint Admissions and Matriculation Board",
      image: "/images/jamb.png",
    },
    {
      name: "WAEC",
      description: "West African Examinations Council",
      image: "/images/waec.png",
    },
    {
      name: "NECO",
      description: "National Examinations Council",
      image: "/images/neco.png",
    },
    {
      name: "POST-UTME",
      description: "Post Unified Tertiary Matriculation Examination",
      image: "/images/jamb.png",
    },
  ];

  // Animated counter hook
  const useCounter = (end, duration = 2) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
      if (inView) {
        let startTime;
        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = (timestamp - startTime) / (duration * 1000);

          if (progress < 1) {
            setCount(Math.floor(end * progress));
            requestAnimationFrame(animate);
          } else {
            setCount(end);
          }
        };
        requestAnimationFrame(animate);
      }
    }, [inView, end, duration]);

    return [count, ref];
  };

  return (
    <div className="min-h-screen bg-white dark:bg-charcoal-900 dark:text-white overflow-x-hidden">
      {/* Hero Section  */}
      <section className="relative overflow-hidden min-h-screen w-full flex items-center">
        {/* Animated Background */}
        <img
          src="/images/6.jpg"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-900/80 to-charcoal-900/20"></div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-400/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * -100 - 50],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
            {/* Left Content with Stagger Animation */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="text-center lg:text-left"
            >
              <motion.h1
                variants={itemVariants}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading text-white mb-4 sm:mb-6 leading-tight"
              >
                Welcome to{" "}
                <motion.span
                  className="bg-gradient-to-r from-primary-500 via-secondary-400 to-secondary-500 bg-clip-text text-transparent inline-block"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% auto",
                  }}
                >
                  Cravins
                </motion.span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg lg:text-xl text-gray-100 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                Embark on your journey to academic excellence with our
                cutting-edge learning platform designed to unlock your potential
                and transform your learning experience with innovative tools.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center lg:justify-start"
              >
                {isAuthenticated ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      Go to Dashboard
                      <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </Link>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/signup"
                        className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        Get Started
                        <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/login"
                        className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all backdrop-blur-sm"
                      >
                        Login
                      </Link>
                    </motion.div>
                  </>
                )}
              </motion.div>

              {/* Animated Stats */}
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-lg mx-auto lg:mx-0"
              >
                {[
                  {
                    icon: UserGroupIcon,
                    value: stats.students,
                    label: "Students",
                    color: "blue",
                  },
                  {
                    icon: BookOpenIcon,
                    value: stats.courses,
                    label: "Courses",
                    color: "green",
                  },
                  {
                    icon: TrophyIcon,
                    value: stats.successRate,
                    label: "Success Rate",
                    color: "yellow",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="text-center"
                  >
                    <motion.div
                      className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-${stat.color}-500/20 backdrop-blur-sm rounded-full mb-2 mx-auto border border-${stat.color}-400/30`}
                      animate={{
                        boxShadow: [
                          `0 0 0 0 rgba(59, 130, 246, 0.4)`,
                          `0 0 0 10px rgba(59, 130, 246, 0)`,
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                    >
                      <stat.icon
                        className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-300`}
                      />
                    </motion.div>
                    <motion.div
                      className="text-xl sm:text-2xl lg:text-3xl font-bold text-white"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-xs sm:text-sm text-gray-300">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Card with 3D Effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
              className="relative hidden lg:block"
              style={{ perspective: "1000px" }}
            >
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  rotateX: 5,
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative bg-white dark:bg-charcoal-800 rounded-3xl shadow-2xl p-8 transform-gpu"
              >
                <motion.div
                  className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -right-4 w-12 h-12 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [360, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                <div className="relative">
                  <motion.div
                    variants={iconFloatVariants}
                    animate="animate"
                    className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mb-6 mx-auto"
                  >
                    <AcademicCapIcon className="w-10 h-10 text-primary-600" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                    Ready to transform your learning experience?
                  </h3>

                  <p className="text-base text-gray-600 dark:text-gray-300 mb-6 text-center">
                    Join thousands of students who are already achieving their
                    academic goals with Cravins.
                  </p>

                  <div className="space-y-3">
                    {[
                      "Personalized learning paths",
                      "Expert-crafted content",
                      "AI-powered assistance",
                    ].map((text, index) => (
                      <motion.div
                        key={text}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center space-x-3"
                      >
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section  */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-charcoal-900 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary-500/5 rounded-full blur-3xl"
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
            className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 mx-auto" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Our comprehensive platform provides all the tools and resources
              you need to excel in your academic journey.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="group"
                >
                  <Link to={isAuthenticated ? feature.href : "/signup"}>
                    <motion.div
                      initial="rest"
                      whileHover="hover"
                      variants={cardHoverVariants}
                      className={`relative bg-white dark:bg-charcoal-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 h-full border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 shadow-lg hover:shadow-2xl ${feature.gradient} overflow-hidden`}
                    >
                      {/* Animated background gradient on hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all duration-500"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      />

                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />

                      <div className="relative z-10">
                        <motion.div
                          className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r ${feature.color} rounded-xl sm:rounded-2xl mb-4 sm:mb-6`}
                          whileHover={{
                            rotate: [0, -10, 10, -10, 0],
                            scale: 1.1,
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                        </motion.div>

                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {feature.title}
                        </h3>

                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
                          {feature.description}
                        </p>

                        <motion.div
                          className="flex items-center text-primary-600 dark:text-primary-400 font-medium text-sm sm:text-base"
                          whileHover={{ x: 10 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {isAuthenticated ? "Explore" : "Get Started"}
                          <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Exam Types Section  */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-charcoal-900 dark:to-charcoal-900 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Prepare for all major exams
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Our platform covers all the essential examinations for Nigerian
              students, ensuring comprehensive preparation.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          >
            {examTypes.map((exam, index) => (
              <motion.div
                key={exam.name}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group bg-white dark:bg-charcoal-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-secondary-500/0"
                  whileHover={{
                    background:
                      "linear-gradient(to bottom right, rgba(255, 0, 0, 0.1), rgba(255, 215, 0, 0.1))",
                  }}
                  transition={{ duration: 0.3 }}
                />

                <motion.img
                  src={exam.image}
                  alt={exam.name}
                  className="object-contain w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-3 sm:mb-4 relative z-10"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6, type: "spring" }}
                />

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors relative z-10">
                  {exam.name}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 flex-grow relative z-10">
                  {exam.description}
                </p>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={isAuthenticated ? "/practice" : "/signup"}
                    className="mt-auto inline-flex items-center px-4 sm:px-6 py-2 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors text-sm sm:text-base relative z-10 shadow-lg"
                  >
                    Start Practice
                    <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section with Fade-in Animation */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-primary-50 to-white dark:from-charcoal-900 dark:to-charcoal-800 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              What Our Students Say
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Hear from thousands of students who have transformed their
              academic journey with Cravins.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative pt-12 sm:pt-14 pb-6 sm:pb-8 px-4 sm:px-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-charcoal-800 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* Animated avatar */}
                <motion.div
                  className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl border-4 border-white dark:border-charcoal-900 shadow-lg"
                  whileHover={{
                    rotate: 360,
                    scale: 1.1,
                  }}
                  transition={{ duration: 0.6 }}
                >
                  {testimonial.name.charAt(0)}
                </motion.div>

                <div className="text-center">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {testimonial.role}
                  </p>

                  {/* Animated stars */}
                  <div className="flex justify-center mb-3 sm:mb-4 space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: 0.5 + index * 0.1 + i * 0.05,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
                      </motion.div>
                    ))}
                  </div>

                  <motion.p
                    className="text-sm sm:text-base text-gray-700 dark:text-gray-300 italic leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    "{testimonial.content}"
                  </motion.p>
                </div>

                {/* Decorative animated elements */}
                <motion.div
                  className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full opacity-40 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.6, 0.4],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 bg-secondary-100 dark:bg-secondary-900/30 rounded-full opacity-30 blur-2xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section  */}
      <section className="py-16 sm:py-20 lg:py-24 relative text-white overflow-hidden">
        <motion.img
          src="/images/4.jpg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.2 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-900/90 to-secondary-600/10 z-0"></div>

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
              }}
              animate={{
                y: [null, Math.random() * -200 - 100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Ready to transform your learning experience?
            </motion.h2>
            <motion.p
              className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Join thousands of students who are already achieving their
              academic goals with Cravins AI-powered learning platform.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {isAuthenticated ? (
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base shadow-2xl"
                  >
                    <AcademicCapIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Continue Learning
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/signup"
                      className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base shadow-2xl"
                    >
                      Start Free Trial
                      <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/about"
                      className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors text-sm sm:text-base backdrop-blur-sm"
                    >
                      Learn More
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
