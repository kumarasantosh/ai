import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

const SimpleFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-9">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Contact Section */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
              Contact Us
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-blue-400" />
                <Link
                  href="mailto:support@companionai.com"
                  className="hover:text-blue-400"
                >
                  support@justsantosh.site
                </Link>
              </div>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-3 text-blue-400 mt-0.5" />
                <span className="text-gray-400">
                  Hyderabad, Telangana, India
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/companions"
                  className="hover:text-blue-400 transition-colors"
                >
                  All Companions
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="hover:text-blue-400 transition-colors"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-blue-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-blue-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="hover:text-blue-400 transition-colors"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
              Legal & Policies
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy-policies"
                  className="hover:text-blue-400 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policies"
                  className="hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policies"
                  className="hover:text-blue-400 transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="https://razorpay.com/terms/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  Razorpay Terms
                </Link>
              </li>
            </ul>
            <div className="mt-4 text-xs text-gray-400">
              Refund Timeline: 5-7 business days
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-white mb-2">CompanionAI</h3>
          <p className="text-gray-400 text-sm">
            AI-powered learning companions for personalized education.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-2 sm:mb-0">
              © {currentYear} Study. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
