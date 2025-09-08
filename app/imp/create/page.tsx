"use client";

import PageStyleManager from "@/components/PageStyle";
import dynamic from "next/dynamic";
import React, { useRef, useState, useEffect } from "react";
import { createBlog } from "@/lib/action/companion.action";

// Fix for duplicate toolbar - add loading component and proper mounting
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 animate-pulse rounded flex items-center justify-center">
      <span className="text-gray-500">Loading Editor...</span>
    </div>
  ),
});

// Define the RichTextEditorHandle type
type RichTextEditorHandle = {
  getContent: () => string;
};

export default function Home() {
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  // Fix for duplicate toolbar - ensure proper mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGetContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      setEditorContent(content);
    }
  };

  // Save function to Supabase
  const handleSaveBlog = async () => {
    if (!title.trim()) {
      setMessage("Please enter a title");
      return;
    }

    if (editorRef.current) {
      const content = editorRef.current.getContent();

      if (!content.trim()) {
        setMessage("Please add some content");
        return;
      }

      setIsLoading(true);
      setMessage("");

      try {
        await createBlog(title, content);
        setMessage("Blog saved successfully!");
        setTitle("");
        setEditorContent("");
        // You might want to reset the editor content here
      } catch (error) {
        console.error("Error saving blog:", error);
        setMessage("Error saving blog. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <PageStyleManager />
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-center font-bold my-5 text-xl">Rich Text Editor</h1>

        {/* Title Input */}
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Blog Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your blog title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Rich Text Editor Container */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden min-h-[300px]">
            {isMounted ? (
              <RichTextEditor ref={editorRef} />
            ) : (
              <div className="h-64 bg-gray-100 animate-pulse rounded flex items-center justify-center">
                <span className="text-gray-500">Loading Editor...</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleGetContent}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Preview Content
          </button>

          <button
            onClick={handleSaveBlog}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Blog"}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-3 rounded mb-4 ${
              message.includes("Error")
                ? "bg-red-100 border border-red-400 text-red-700"
                : "bg-green-100 border border-green-400 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Content Preview */}
        {editorContent && (
          <div className="mt-4">
            <h2 className="font-bold text-lg mb-2">Editor Content Preview:</h2>
            <div
              className="border p-4 rounded bg-gray-50 min-h-[100px]"
              dangerouslySetInnerHTML={{ __html: editorContent }}
            />
          </div>
        )}
      </div>
    </>
  );
}
