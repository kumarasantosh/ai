"use client";
import React, { useState } from "react";
import {
  FileText,
  Shield,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const LegalPoliciesPage = () => {
  const [activeSection, setActiveSection] = useState("terms");

  const PolicySection = ({ id, title, icon: Icon, children }) => (
    <div
      className={`policy-section ${activeSection === id ? "active" : "hidden"}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
          <Icon size={24} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="prose max-w-none">{children}</div>
    </div>
  );

  const RefundTimeline = () => (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200 my-6">
      <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Clock className="text-green-600" size={20} />
        Refund Processing Timeline
      </h4>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            1
          </div>
          <div>
            <div className="font-medium">Request Submission</div>
            <div className="text-gray-600">
              Immediate acknowledgment upon form submission
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            2
          </div>
          <div>
            <div className="font-medium">Review Process</div>
            <div className="text-gray-600">
              2-5 business days for request evaluation
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            3
          </div>
          <div>
            <div className="font-medium">Refund Processing</div>
            <div className="text-gray-600">
              5-10 business days to original payment method
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            4
          </div>
          <div>
            <div className="font-medium">Bank Processing</div>
            <div className="text-gray-600">
              Additional 3-5 business days depending on your bank
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
          <div className="text-sm text-yellow-800">
            <strong>Total Timeline:</strong> Expect your refund within 15-20
            business days from approval. International cards may take additional
            time.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Our - Legal Policies
          </h1>
          <p className="text-xl text-gray-600">
            Terms, privacy, and refund policies for our AI courses and
            educational services
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {[
            { id: "terms", label: "Terms & Conditions", icon: FileText },
            { id: "refund", label: "Refund & Cancellation", icon: CreditCard },
            { id: "privacy", label: "Privacy Policy", icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeSection === id
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                  : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-md"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <PolicySection id="terms" title="Terms & Conditions" icon={FileText}>
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold mb-3 text-blue-800">
                  AI Course Access Agreement
                </h3>
                <p className="text-gray-700">
                  By enrolling in our AI courses, you acknowledge that you have
                  read, understood, and agree to be bound by these Terms and
                  Conditions. These terms govern your access to all AI courses,
                  materials, and educational resources on our platform.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  1. Course Access & Content
                </h3>
                <p className="text-gray-700 mb-3">
                  Our AI courses include video lectures, interactive labs, code
                  repositories, assignments, and supplementary materials. All
                  content is designed for educational purposes and personal
                  skill development in artificial intelligence and machine
                  learning.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    Lifetime access to purchased course materials (unless
                    otherwise specified)
                  </li>
                  <li>Regular content updates and new module additions</li>
                  <li>Access to course forums and community discussions</li>
                  <li>
                    Downloadable resources and code samples for personal use
                  </li>
                  <li>
                    Certificate of completion upon meeting course requirements
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  2. Educational Use & Intellectual Property
                </h3>
                <p className="text-gray-700 mb-3">
                  Course materials are for personal educational use only.
                  Students agree to:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Not redistribute, share, or resell course content</li>
                  <li>
                    Respect copyright of all AI models, datasets, and materials
                  </li>
                  <li>
                    Use provided code and resources ethically and responsibly
                  </li>
                  <li>Not engage in academic dishonesty or plagiarism</li>
                  <li>Follow AI ethics guidelines taught in our courses</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  3. Technical Requirements & Support
                </h3>
                <p className="text-gray-700 mb-3">
                  AI courses require specific technical setups. We provide
                  technical support for course-related issues, but students are
                  responsible for having compatible hardware and software for
                  hands-on labs.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    Minimum system requirements provided before enrollment
                  </li>
                  <li>
                    Cloud-based lab environments available for most courses
                  </li>
                  <li>Technical support available during business hours</li>
                  <li>Course prerequisites clearly stated in descriptions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  4. AI Ethics & Responsible Use
                </h3>
                <p className="text-gray-700">
                  Students must use AI knowledge responsibly and ethically. We
                  do not support the development of harmful AI applications,
                  including those that could cause discrimination, privacy
                  violations, or societal harm. Students agree to follow ethical
                  AI principles taught in our courses.
                </p>
              </div>
            </div>
          </PolicySection>

          <PolicySection
            id="refund"
            title="Refund & Cancellation Policy"
            icon={CreditCard}
          >
            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
                <h3 className="text-xl font-semibold mb-3 text-green-800">
                  Course Satisfaction Guarantee
                </h3>
                <p className="text-gray-700">
                  We're committed to providing high-quality AI education. If
                  you're not satisfied with your course experience, our
                  comprehensive refund policy ensures your investment is
                  protected. We believe in the value of our AI courses and want
                  every student to succeed.
                </p>
              </div>

              <RefundTimeline />

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Eligibility for Refunds
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Eligible for Full Refund
                    </h4>
                    <ul className="text-sm space-y-1 text-green-700">
                      <li>• Within 30 days of course purchase</li>
                      <li>• Less than 20% of course content accessed</li>
                      <li>• Technical issues preventing course access</li>
                      <li>
                        • Course content significantly different from
                        description
                      </li>
                      <li>• Duplicate course purchases</li>
                      <li>• Course prerequisites not clearly stated</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Not Eligible for Refund
                    </h4>
                    <ul className="text-sm space-y-1 text-red-700">
                      <li>• Requests after 30-day period</li>
                      <li>• More than 80% of course content accessed</li>
                      <li>• Certificate of completion already issued</li>
                      <li>
                        • Violation of course terms or academic dishonesty
                      </li>
                      <li>• Custom mentoring sessions already completed</li>
                      <li>• Course bundles with partial completion</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Cancellation Process
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      For Course Subscriptions:
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Cancel anytime through your student dashboard</li>
                      <li>
                        Access continues until end of current billing period
                      </li>
                      <li>
                        Download completed course materials before cancellation
                      </li>
                      <li>
                        No charges for future monthly/annual subscriptions
                      </li>
                      <li>Email confirmation with access end date</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      For Individual Courses:
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>
                        Submit refund request through student support portal
                      </li>
                      <li>
                        Include enrollment ID and specific reason for refund
                      </li>
                      <li>
                        Instructor review for courses with mentoring included
                      </li>
                      <li>
                        Progress assessment (must be under 20% completion)
                      </li>
                      <li>Approved refunds processed within timeline above</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Partial Refunds & Course Credits
                </h3>
                <p className="text-gray-700 mb-3">
                  We may offer partial refunds or course credits based on
                  progress and specific circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    Pro-rated refunds for annual subscriptions (20-50% progress)
                  </li>
                  <li>
                    Course credits for switching to different AI specializations
                  </li>
                  <li>
                    Partial refunds for course bundles with minimal progress
                  </li>
                  <li>
                    Credits towards advanced courses for beginners who need
                    prerequisites
                  </li>
                </ul>
              </div>
            </div>
          </PolicySection>

          <PolicySection id="privacy" title="Privacy Policy" icon={Shield}>
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold mb-3 text-purple-800">
                  AI Education Privacy
                </h3>
                <p className="text-gray-700">
                  Your learning journey and personal data are protected with the
                  highest standards. We understand the sensitivity of
                  educational records and AI project data, and we're committed
                  to maintaining your privacy throughout your learning
                  experience.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  1. Information We Collect
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Student Information</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Name, email, and contact details</li>
                      <li>• Educational background and skill level</li>
                      <li>• Payment and billing information</li>
                      <li>• Course preferences and learning goals</li>
                      <li>• Certificate and completion records</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Learning Analytics</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Course progress and completion rates</li>
                      <li>• Quiz scores and assignment submissions</li>
                      <li>• Video watch time and engagement metrics</li>
                      <li>• AI lab usage and code submissions</li>
                      <li>• Forum participation and peer interactions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  2. How We Use Your Information
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Course Delivery:</strong> To provide AI courses,
                    track progress, and issue certificates
                  </li>
                  <li>
                    <strong>Personalized Learning:</strong> To recommend courses
                    and customize learning paths
                  </li>
                  <li>
                    <strong>Educational Support:</strong> To provide technical
                    help and mentoring services
                  </li>
                  <li>
                    <strong>Progress Analytics:</strong> To help you understand
                    your learning journey
                  </li>
                  <li>
                    <strong>Community Features:</strong> To enable peer
                    interactions and study groups
                  </li>
                  <li>
                    <strong>Course Improvement:</strong> To enhance content
                    based on student feedback
                  </li>
                  <li>
                    <strong>Certification:</strong> To verify completion and
                    maintain academic records
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  3. Data Sharing and Disclosure
                </h3>
                <p className="text-gray-700 mb-3">
                  We do not sell your personal information. We may share data
                  only in these limited circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    With educational technology partners for lab environments
                  </li>
                  <li>With certificate verification services</li>
                  <li>With cloud computing providers for AI model hosting</li>
                  <li>
                    When required by educational institutions or employers
                  </li>
                  <li>For legal compliance and safety purposes</li>
                  <li>With your explicit consent for career services</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">4. Data Security</h3>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-gray-700">
                    We implement industry-standard security measures including
                    end-to-end encryption for student communications, secure
                    cloud storage for course materials, regular security audits
                    of our AI lab environments, and strict access controls to
                    protect your educational records and project data.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  5. Your Rights and Choices
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Student Records</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• View and update your profile</li>
                      <li>• Download course certificates</li>
                      <li>• Export your learning progress</li>
                      <li>• Delete your student account</li>
                      <li>• Opt-out of marketing emails</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Learning Privacy</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Control progress sharing</li>
                      <li>• Manage community visibility</li>
                      <li>• Request data portability</li>
                      <li>• Control analytics collection</li>
                      <li>• Hide from leaderboards</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  6. Data Retention
                </h3>
                <p className="text-gray-700">
                  We retain your educational records and course progress for as
                  long as you maintain an active account. Completed certificates
                  and academic achievements are maintained indefinitely for
                  verification purposes. Course interaction data may be
                  anonymized for educational research after account closure.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">7. Contact Us</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    For privacy-related questions about your educational records
                    or to exercise your rights, contact our Student Privacy
                    Officer at:
                  </p>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    <li>
                      <strong>Email:</strong> privacy@jussantosh.site
                    </li>
                    <li>
                      <strong>Student Portal:</strong> Available 24/7 for
                      privacy requests
                    </li>
                    <li>
                      <strong>Response Time:</strong> Within 5 business days for
                      educational records
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </PolicySection>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-xl">
          <p className="text-gray-600">
            For questions about these policies or your AI course enrollment,
            please contact our student support team at{" "}
            <a
              href="mailto:support@justsantosh.site"
              className="text-blue-600 hover:underline"
            >
              support@justsantosh.site
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .policy-section {
          transition: all 0.3s ease-in-out;
        }
        .policy-section.hidden {
          display: none;
        }
        .prose {
          color: #374151;
        }
        .prose h3 {
          color: #1f2937;
        }
        .prose h4 {
          color: #374151;
        }
      `}</style>
    </div>
  );
};

export default LegalPoliciesPage;
