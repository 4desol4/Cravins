import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpenIcon,
  UserGroupIcon,
  TrophyIcon,
  StarIcon,
  AcademicCapIcon,
  LightBulbIcon,
  HeartIcon,
  SparklesIcon,
  CheckCircleIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";

const About = () => {
  const [activeTab, setActiveTab] = useState("story");

  const stats = [
    {
      icon: UserGroupIcon,
      number: "50,000+",
      label: "Students Served",
      color: "from-blue-500 to-purple-600",
    },
    {
      icon: BookOpenIcon,
      number: "1,000+",
      label: "Practice Questions",
      color: "from-green-500 to-teal-600",
    },
    {
      icon: TrophyIcon,
      number: "98%",
      label: "Success Rate",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: StarIcon,
      number: "4.9/5",
      label: "Student Rating",
      color: "from-pink-500 to-red-600",
    },
  ];

  const team = [
    {
      name: "Mr Olumide",
      role: "Founder & CEO",
      image: "/team/ceo.jpg",
      bio: "Former professor 15 years experience in Nigerian education system.",
      linkedin: "#",
    },
    {
      name: "Prof. Funmi Adeoye",
      role: "Head of Curriculum",
      image: "/team/curriculum.jpg",
      bio: "Former University of Lagos professor specializing in educational technology.",
      linkedin: "#",
    },
    {
      name: "Eng. Kemi Johnson",
      role: "CTO",
      image: "/team/cto.jpg",
      bio: "Tech expert with background in AI and machine learning applications.",
      linkedin: "#",
    },
    {
      name: "Mr. Tunde Bakare",
      role: "Content Director",
      image: "/team/content.jpg",
      bio: "Former secondary school principal with expertise in WAEC and NECO.",
      linkedin: "#",
    },
  ];

  const values = [
    {
      icon: AcademicCapIcon,
      title: "Excellence in Education",
      description:
        "We are committed to providing world-class educational content that meets international standards while being relevant to Nigerian students.",
    },
    {
      icon: LightBulbIcon,
      title: "Innovation First",
      description:
        "We leverage cutting-edge technology including AI and machine learning to create personalized learning experiences.",
    },
    {
      icon: HeartIcon,
      title: "Student-Centered",
      description:
        "Every decision we make is guided by what is best for our students and their academic success.",
    },
    {
      icon: SparklesIcon,
      title: "Continuous Improvement",
      description:
        "We continuously evolve our platform based on student feedback and educational best practices.",
    },
  ];

  const milestones = [
    {
      year: "2020",
      title: "Cravins Founded",
      description:
        "Started with a vision to revolutionize education in Nigeria",
    },
    {
      year: "2021",
      title: "First 1,000 Students",
      description: "Reached our first milestone of serving 1,000 students",
    },
    {
      year: "2022",
      title: "AI Integration",
      description: "Launched our AI-powered tutoring system",
    },
    {
      year: "2023",
      title: "10,000+ Students",
      description: "Expanded to serve over 10,000 students nationwide",
    },
    {
      year: "2024",
      title: "Premium Launch",
      description: "Launched mobile app",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-charcoal-900 dark:to-charcoal-800 text-gray-900 dark:text-charcoal-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-secondary-600/10 dark:from-primary-400/5 dark:to-secondary-400/5"></div>
        <div className="container-max section-padding py-20 lg:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-6">
                <AcademicCapIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl lg:text-6xl font-heading mb-6">
                About{" "}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Cravins
                </span>
              </h1>
              <p className="text-xl max-w-3xl mx-auto leading-relaxed">
                Transforming education in Nigeria through innovative technology
                and personalized learning experiences. We're on a mission to
                help every student achieve their academic dreams.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-charcoal-900/50 backdrop-blur-sm">
        <div className="container-max section-padding">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-full mb-4`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-charcoal-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container-max section-padding">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex bg-white dark:bg-charcoal-900 rounded-full p-2 shadow-lg">
              {[
                { id: "story", label: "Our Story" },
                { id: "team", label: "Our Team" },
                { id: "values", label: "Our Values" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary-600 text-white shadow-lg"
                      : "text-gray-600 dark:text-charcoal-300 hover:bg-gray-100 dark:hover:bg-charcoal-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {activeTab === "story" && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-6">Our Journey</h2>
                  <p className="text-lg leading-relaxed">
                    Cravins was born from a simple observation: Nigerian
                    students deserved better educational tools. Founded in 2020
                    by a team of educators and technologists, we set out to
                    bridge the gap between traditional learning and modern
                    technology.
                  </p>
                </div>

                {/* Timeline */}
                <div className="space-y-8">
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.year}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`flex items-center ${
                        index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                      }`}
                    >
                      <div className="flex-1">
                        <div
                          className={`p-6 bg-white dark:bg-charcoal-900 rounded-xl shadow-lg ${
                            index % 2 === 0 ? "mr-8 text-right" : "ml-8"
                          }`}
                        >
                          <div className="text-2xl font-bold text-primary-600 mb-2">
                            {milestone.year}
                          </div>
                          <h3 className="text-xl font-semibold mb-2">
                            {milestone.title}
                          </h3>
                          <p className="text-gray-600 dark:text-charcoal-300">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                      <div className="w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg"></div>
                      <div className="flex-1"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "team" && (
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-6">Meet Our Team</h2>
                  <p className="text-lg mb-6">
                    Our diverse team of educators, technologists, and innovators
                    work together to create exceptional learning experiences.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {team.map((member, index) => (
                    <motion.div
                      key={member.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="text-center group"
                    >
                      <div className="relative mb-4">
                        <div className="w-40 h-40 mx-auto bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full p-1">
                          <div className="w-full h-full bg-gray-200 dark:bg-charcoal-800 rounded-full flex items-center justify-center">
                            <span className="text-4xl font-bold text-gray-600 dark:text-charcoal-300">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {member.name}
                      </h3>
                      <p className="text-primary-600 font-medium mb-3">
                        {member.role}
                      </p>
                      <p className="text-gray-600 dark:text-charcoal-300 text-sm">
                        {member.bio}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "values" && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-6">Our Core Values</h2>
                  <p className="text-lg mb-6">
                    These values guide everything we do and help us stay focused
                    on our mission to transform education.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {values.map((value, index) => (
                    <motion.div
                      key={value.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="p-8 bg-white dark:bg-charcoal-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mr-4">
                          <value.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold">{value.title}</h3>
                      </div>
                      <p className="text-gray-600 dark:text-charcoal-300 leading-relaxed">
                        {value.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container-max section-padding">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            <motion.div variants={itemVariants}>
              <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
              <p className="text-lg leading-relaxed opacity-90">
                To democratize quality education in Nigeria by providing
                accessible, affordable, and effective learning tools that help
                students excel in their academic pursuits and achieve their
                career goals.
              </p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
              <p className="text-lg leading-relaxed opacity-90">
                To be the leading educational technology platform in Africa,
                empowering millions of students with personalized learning
                experiences that adapt to their unique needs and learning
                styles.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-max section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6">
              Ready to Join Our Learning Community?
            </h2>
            <p className="text-lg mb-8">
              Join thousands of students who are already achieving their
              academic goals with Cravins. Start your journey today and
              experience the future of learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary btn-lg flex items-center space-x-2">
                <span>Get Started Free</span>
                <PlayCircleIcon className="w-5 h-5" />
              </button>
              <button className="btn btn-outline btn-lg">Contact Us</button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
