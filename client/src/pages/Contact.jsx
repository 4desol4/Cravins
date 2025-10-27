import { useState } from "react";
import { motion } from "framer-motion";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: "Email Us",
      details: "support@cravins.com",
      subtitle: "Send us an email anytime",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: PhoneIcon,
      title: "Call Us",
      details: "+234 800 123 4567",
      subtitle: "Mon-Fri from 8am to 5pm",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: MapPinIcon,
      title: "Visit Us",
      details: "Lagos, Nigeria",
      subtitle: "Come say hello at our office",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: "#", color: "text-blue-600" },
    { icon: FaTwitter, href: "#", color: "text-sky-500" },
    { icon: FaInstagram, href: "#", color: "text-pink-500" },
    { icon: FaLinkedin, href: "#", color: "text-blue-700" },
  ];

  const faqs = [
    {
      question: "How do I get started?",
      answer:
        "Simply sign up for a free account and start exploring our practice tests and learning materials.",
    },
    {
      question: "What subjects are covered?",
      answer:
        "We cover all major JAMB, WAEC, and NECO subjects including Mathematics, English, Physics, Chemistry, Biology, and more.",
    },
    {
      question: "Is there a mobile app?",
      answer:
        "Yes! Our platform is fully responsive and works great on mobile devices. A dedicated app is coming soon.",
    },
    {
      question: "How much does premium cost?",
      answer:
        "Premium plans start at ₦2,000 per month with discounts for longer subscriptions.",
    },
  ];

  return (
    <div className="min-h-screen relative bg-white dark:bg-charcoal-900 dark:text-white py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl"
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
          className="absolute bottom-40 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-heading text-charcoal-900 dark:text-white mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-white max-w-3xl mx-auto">
            Have questions about Cravins? We're here to help! Reach out to us
            anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-charcoal-700"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {info.title}
                  </h3>
                  <p className="text-gray-900 dark:text-white font-medium mb-1">
                    {info.details}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {info.subtitle}
                  </p>
                </motion.div>
              ))}

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-charcoal-700"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className={`w-10 h-10 rounded-lg ${social.color} hover:scale-110 transition-transform duration-200 flex items-center justify-center`}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Office Hours */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-charcoal-700"
              >
                <div className="flex items-center mb-4">
                  <ClockIcon className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Office Hours
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Monday - Friday
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      8:00 AM - 5:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Saturday
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      9:00 AM - 2:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Sunday
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      Closed
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-charcoal-700"
            >
              <div className="flex items-center mb-6">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Send us a Message
                </h2>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Thank you for contacting us. We'll get back to you soon!
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-charcoal-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-charcoal-800 text-gray-900 dark:text-white transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-charcoal-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-charcoal-800 text-gray-900 dark:text-white transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-charcoal-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-charcoal-800 text-gray-900 dark:text-white transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-charcoal-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-charcoal-800 text-gray-900 dark:text-white transition-colors resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
       
        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white  dark:bg-charcoal-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-charcoal-700"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
