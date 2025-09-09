"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, Eye, ArrowRight } from "lucide-react";
import { getBlogs } from "@/lib/action/companion.action";

// Define blog type
type Blog = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
};

export default function BlogCardsDisplay() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch blogs on component mount
  useEffect(() => {
    if (isMounted) {
      fetchBlogs();
    }
  }, [isMounted]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBlogs();
      setBlogs(data || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to truncate content for preview
  const truncateContent = (content: string, maxLength: number = 120) => {
    const textContent = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + "..."
      : textContent;
  };

  // Function to estimate read time
  const estimateReadTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const readTime = Math.ceil(words / 200); // Average reading speed
    return readTime;
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Generate gradient for each card
  const getGradient = (index: number) => {
    const gradients = [
      "from-purple-400 via-pink-500 to-red-500",
      "from-blue-400 via-teal-500 to-green-500",
      "from-yellow-400 via-orange-500 to-red-500",
      "from-green-400 via-blue-500 to-purple-500",
      "from-pink-400 via-purple-500 to-indigo-500",
      "from-indigo-400 via-purple-500 to-pink-500",
    ];
    return gradients[index % gradients.length];
  };

  // Don't render anything until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-300 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-300 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-300 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-300 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Oops!
          </h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            onClick={fetchBlogs}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Learn Now
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get The LAtest and important Questions
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">📝</div>
            <h3 className="text-3xl font-bold text-gray-700 mb-4">
              No blogs yet
            </h3>
            <p className="text-gray-500 text-lg mb-8">
              Be the first to share your story!
            </p>
            <Link
              href="/create-blog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              <span>Create First Blog</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <>
            {/* Blog Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, index) => (
                <div
                  key={blog.id}
                  className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                  onMouseEnter={() => setHoveredCard(blog.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Link href={`/imp/${blog.id}`} className="block h-full">
                    {/* Gradient Header */}
                    <div
                      className={`h-48 bg-gradient-to-br ${getGradient(
                        index
                      )} relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                      {/* Floating Elements */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
                          #{index + 1}
                        </div>
                      </div>

                      {/* Animated Shapes */}
                      <div
                        className={`absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full transition-transform duration-700 ${
                          hoveredCard === blog.id
                            ? "scale-150 rotate-45"
                            : "scale-100"
                        }`}
                      ></div>
                      <div
                        className={`absolute -bottom-5 -left-5 w-16 h-16 bg-white/10 rounded-full transition-transform duration-500 ${
                          hoveredCard === blog.id
                            ? "scale-125 -rotate-45"
                            : "scale-100"
                        }`}
                      ></div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(blog.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {estimateReadTime(blog.content)} min read
                        </div>
                      </div>

                      <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                        {blog.title}
                      </h2>

                      <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-grow">
                        {truncateContent(blog.content)}
                      </p>

                      {/* Action Button */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300 transform group-hover:scale-105 text-sm font-medium">
                          <Eye className="w-4 h-4" />
                          Read More
                        </div>

                        <div className="text-xs text-gray-400">
                          Card #{index + 1}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 transition-opacity duration-300 pointer-events-none ${
                        hoveredCard === blog.id ? "opacity-100" : "opacity-0"
                      }`}
                    ></div>
                  </Link>{" "}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Custom CSS for better styling */}
      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
