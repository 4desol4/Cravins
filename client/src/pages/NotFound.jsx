import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  HomeIcon, 
  ArrowLeftIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline'

const NotFound = () => {
  const floatingElements = [
    { id: 1, delay: 0, duration: 6 },
    { id: 2, delay: 1, duration: 8 },
    { id: 3, delay: 2, duration: 7 },
    { id: 4, delay: 0.5, duration: 9 },
    { id: 5, delay: 1.5, duration: 5 }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-charcoal-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Floating Background Elements */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-300/10 dark:to-purple-300/10"
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent select-none">
            404
          </h1>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <AcademicCapIcon className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Page Not Found
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            Looks like you've wandered off the learning path. The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Go Back
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
            Looking for something specific?
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Practice Tests', path: '/practice' },
              { name: 'Video Lessons', path: '/videos' },
              { name: 'Study Materials', path: '/materials' },
              { name: 'AI Tutor', path: '/chatbot' }
            ].map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className="block p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Fun Fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8 text-sm text-gray-500 dark:text-gray-400"
        >
          <p>Fun fact: 404 errors are named after room 404 at CERN, where the World Wide Web was born!</p>
        </motion.div>
      </div>

      {/* Animated Mascot */}
      <motion.div
        className="fixed bottom-4 right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="text-2xl">🎓</span>
      </motion.div>
    </div>
  )
}

export default NotFound