import { Link } from "react-router-dom";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "Practice Tests", href: "/practice" },
      { name: "Video Lessons", href: "/videos" },
      { name: "Study Materials", href: "/materials" },
      { name: "AI Tutor", href: "/chatbot" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "News & Updates", href: "/news" },
      { name: "Careers", href: "/careers" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
    exams: [
      { name: "JAMB Preparation", href: "/exams/jamb" },
      { name: "WAEC Preparation", href: "/exams/waec" },
      { name: "NECO Preparation", href: "/exams/neco" },
      { name: "POST-UTME", href: "/exams/post-utme" },
    ],
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebook,
      href: "#",
      color: "hover:text-blue-600",
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      href: "#",
      color: "hover:text-blue-400",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      href: "#",
      color: "hover:text-pink-600",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      href: "#",
      color: "hover:text-blue-700",
    },
    {
      name: "YouTube",
      icon: FaYoutube,
      href: "#",
      color: "hover:text-red-600",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-max section-padding">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Cravins</span>
              </Link>

              <p className="text-gray-400 mb-6 max-w-md">
                Empowering Nigerian students to excel in JAMB, WAEC, NECO, and
                other examinations through cutting-edge e-learning technology
                and AI-powered tutoring.
              </p>

              {/* Contact Info */}
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@cravins.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+234 800 123 4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Lagos, Nigeria</span>
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exam Prep Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Exam Prep</h3>
              <ul className="space-y-2">
                {footerLinks.exams.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="py-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-400">
                Get the latest exam tips, study materials, and platform updates.
              </p>
            </div>

            <div className="flex w-full md:w-auto max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-primary-500 text-white placeholder-gray-400"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-r-lg hover:from-primary-700 hover:to-secondary-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Copyright */}
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Cravins. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`text-gray-400 ${social.color} transition-colors`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
