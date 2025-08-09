import React, { useState } from "react";

const TestFeatureComingSoon = () => {
  const [isInterested, setIsInterested] = useState(false);

  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-lg animate-pulse animation-delay-2000"></div>
      </div>

      {/* Main card */}
      <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl">
        {/* Header section */}
        <div className="text-center mb-6">
          {/* Beta badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full px-4 py-2 mb-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-blue-300 text-sm font-medium">
              Knowledge Test Feature
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Coming Soon
            </span>
          </h1>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We're putting the finishing touches on an exciting new knowledge
            test feature. Get ready to experience enhanced functionality that
            will transform your workflow.
          </p>
        </div>

        {/* Feature preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Enhanced Testing</h3>
            <p className="text-gray-400 text-sm">
              Advanced testing capabilities with real-time feedback and detailed
              analytics.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-400 text-sm">
              Optimized performance with instant results and seamless user
              experience.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Reliable Results</h3>
            <p className="text-gray-400 text-sm">
              Consistent, accurate testing with comprehensive reporting and
              insights.
            </p>
          </div>
        </div>

        {/* Status and CTA */}
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center space-x-3 bg-white/5 rounded-full px-6 py-3 border border-white/10">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="text-gray-300">
                Final testing in progress...
              </span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-4">Development Status</p>
            <div className="w-full max-w-md mx-auto bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full animate-pulse"
                style={{ width: "92%" }}
              ></div>
            </div>
            <p className="text-white font-medium mt-2">92% Complete</p>
          </div>

          {!isInterested ? (
            <button
              onClick={() => setIsInterested(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-blue-500/25"
            >
              Notify Me When Ready
            </button>
          ) : (
            <div className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-400/30 rounded-full px-6 py-3 text-green-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">We'll notify you!</span>
            </div>
          )}

          <p className="text-gray-400 text-sm mt-4">
            Be among the first to try our new test feature
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestFeatureComingSoon;
