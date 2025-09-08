"use client";

import { getBlog } from "@/lib/action/companion.action";
import { useState, useEffect, useRef } from "react";

type Blog = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
};

interface BlogByIdProps {
  blogId: number;
}

export default function BlogByIdDisplay({ blogId }: BlogByIdProps) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    {}
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBlog();
    // Load checked items from localStorage
    const savedItems = localStorage.getItem(`blog-${blogId}-checkboxes`);
    if (savedItems) {
      setCheckedItems(JSON.parse(savedItems));
    }
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBlog(blogId);
      setBlog(data);
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Blog not found or failed to load.");
    } finally {
      setLoading(false);
    }
  };

  // Convert li elements to checkboxes after content loads
  useEffect(() => {
    if (blog && contentRef.current) {
      convertListItemsToCheckboxes();
    }
  }, [blog, checkedItems]);

  const convertListItemsToCheckboxes = () => {
    if (!contentRef.current) return;

    const listItems = contentRef.current.querySelectorAll("li");
    listItems.forEach((li, index) => {
      const checkboxId = `${blogId}-li-${index}`;

      if (li.querySelector('input[type="checkbox"]')) return;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = checkboxId;
      checkbox.checked = checkedItems[checkboxId] || false;

      // Ensure visible and styled checkbox
      checkbox.className =
        "mr-3 w-6 h-6 rounded border-2 border-gray-400 cursor-pointer accent-green-500 bg-white flex-shrink-0 transition-colors duration-200";

      checkbox.addEventListener("change", (e) => {
        handleCheckboxChange(
          checkboxId,
          (e.target as HTMLInputElement).checked
        );
      });

      const label = document.createElement("label");
      label.htmlFor = checkboxId;
      label.className = `cursor-pointer flex-1 transition-colors duration-200 ${
        checkbox.checked
          ? "text-gray-400 line-through bg-gray-100 rounded px-2"
          : "text-gray-700 bg-transparent"
      }`;
      label.innerHTML = li.innerHTML;

      li.innerHTML = "";
      li.className = "flex items-center my-2"; // ensures proper flex layout
      li.appendChild(checkbox);
      li.appendChild(label);
    });
  };

  const handleCheckboxChange = (checkboxId: string, checked: boolean) => {
    const newCheckedItems = { ...checkedItems, [checkboxId]: checked };
    setCheckedItems(newCheckedItems);

    const label = document.querySelector(
      `label[for="${checkboxId}"]`
    ) as HTMLElement;
    if (label) {
      label.className = `cursor-pointer flex-1 transition-colors duration-200 ${
        checked
          ? "text-gray-400 line-through bg-gray-100 rounded px-2"
          : "text-gray-700 bg-transparent"
      }`;
    }

    localStorage.setItem(
      `blog-${blogId}-checkboxes`,
      JSON.stringify(newCheckedItems)
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {blog.title}
          </h1>
          <p className="text-sm text-gray-500">
            Published: {formatDate(blog.created_at)}
            {blog.updated_at && (
              <span className="ml-4">
                Updated: {formatDate(blog.updated_at)}
              </span>
            )}
          </p>
        </header>

        <div
          ref={contentRef}
          className="max-w-none text-gray-700 leading-relaxed
                     [&_ul]:my-4 [&_ul]:space-y-1
                     [&_ol]:my-4 [&_ol]:space-y-1
                     [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-6
                     [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:my-5
                     [&_h3]:text-lg [&_h3]:font-medium [&_h3]:my-4
                     [&_p]:my-4 [&_p]:leading-7
                     [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800
                     [&_strong]:font-semibold [&_em]:italic
                     [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:my-6 [&_blockquote]:italic
                     [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </div>
  );
}
