import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const SubjectSelector = ({
  subjects = [],
  selectedSubjects = [],
  onSelectionChange,
  maxSelection = 5,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubjectToggle = (subjectId) => {
    const isSelected = selectedSubjects.includes(subjectId);
    let newSelection;

    if (isSelected) {
      newSelection = selectedSubjects.filter((id) => id !== subjectId);
    } else {
      if (selectedSubjects.length < maxSelection) {
        newSelection = [...selectedSubjects, subjectId];
      } else {
        return;
      }
    }

    onSelectionChange(newSelection);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 dark:bg-charcoal-700 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-charcoal-700 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-charcoal-700 border-2 border-gray-200 dark:border-charcoal-600 text-gray-900 dark:text-white rounded-xl focus:border-primary-500 dark:focus:border-primary-400 focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredSubjects.map((subject, index) => {
            const isSelected = selectedSubjects.includes(subject.id);
            const isDisabled =
              !isSelected && selectedSubjects.length >= maxSelection;

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <motion.button
                  onClick={() => handleSubjectToggle(subject.id)}
                  disabled={isDisabled}
                  whileHover={isDisabled ? {} : { scale: 1.03, y: -4 }}
                  whileTap={isDisabled ? {} : { scale: 0.98 }}
                  className={`relative w-full p-6 rounded-2xl border-2 transition-all text-left group ${
                    isSelected
                      ? "border-primary-500 dark:border-primary-400 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 shadow-xl"
                      : isDisabled
                      ? "border-gray-200 dark:border-charcoal-600 bg-gray-50 dark:bg-charcoal-700 opacity-50 cursor-not-allowed"
                      : "border-gray-200 dark:border-charcoal-600 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg bg-white dark:bg-charcoal-700"
                  }`}
                >
                  {/* Selection Badge */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <CheckIcon className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all ${
                      isSelected
                        ? "bg-gradient-to-br from-primary-500 to-secondary-600 shadow-lg"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-charcoal-600 dark:to-charcoal-500 group-hover:from-primary-100 group-hover:to-secondary-100 dark:group-hover:from-primary-900/40 dark:group-hover:to-secondary-900/40"
                    }`}
                  >
                    <AcademicCapIcon
                      className={`w-7 h-7 transition-colors ${
                        isSelected
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3
                      className={`text-lg font-bold transition-colors ${
                        isSelected
                          ? "text-primary-900 dark:text-primary-100"
                          : "text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300"
                      }`}
                    >
                      {subject.name}
                    </h3>
                    {subject.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {subject.description}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-charcoal-600">
                    {subject._count?.topics > 0 && (
                      <div className="flex items-center space-x-1 text-xs">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? "bg-primary-500" : "bg-blue-500"
                          }`}
                        ></div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {subject._count.topics} topics
                        </span>
                      </div>
                    )}
                    {subject._count?.questions > 0 && (
                      <div className="flex items-center space-x-1 text-xs">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? "bg-secondary-500" : "bg-green-500"
                          }`}
                        ></div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {subject._count.questions} questions
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Disabled Overlay */}
                  {isDisabled && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-charcoal-900/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Max {maxSelection} subjects
                      </span>
                    </div>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {filteredSubjects.length === 0 && searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <AcademicCapIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No subjects found matching "{searchTerm}"
          </p>
        </motion.div>
      )}

      {/* Selection Summary */}
      {selectedSubjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border-2 border-primary-200 dark:border-primary-800"
        >
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              {selectedSubjects.length}{" "}
              {selectedSubjects.length === 1 ? "subject" : "subjects"} selected
            </span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {maxSelection - selectedSubjects.length} remaining
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SubjectSelector;
