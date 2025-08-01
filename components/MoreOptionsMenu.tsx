"use client";

import { deleteCompanion } from "@/lib/action/companion.action";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MoreOptionsMenu = ({
  courseId,
  courseName,
  role,
}: {
  courseId: string;
  courseName: string;
  role?: string;
}) => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOptionClick = (action: string) => {
    setIsOpen(false);

    switch (action) {
      case "share":
        if (navigator.share) {
          navigator
            .share({
              title: courseName,
              url: `${window.location.origin}/companions/details/${courseId}`,
            })
            .catch(() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/companions/details/${courseId}`
              );
              alert("Course link copied to clipboard!");
            });
        } else {
          navigator.clipboard.writeText(
            `${window.location.origin}/companions/details/${courseId}`
          );
          alert("Course link copied to clipboard!");
        }
        break;
      case "edit":
        router.push(`/update?courseid=${courseId}`);
        break;
      case "delete":
        setShowDeleteConfirm(true);
        break;
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteCompanion(courseId);

      if (res?.success || !res?.error) {
        router.push("/companions");
      } else {
        alert("Failed to delete course.");
        console.error(res?.error);
      }
    } catch (err) {
      alert("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => setShowDeleteConfirm(false);

  const canEdit = role === "admin" || role === "teacher";
  const canDelete = role === "admin";

  return (
    <>
      <div className="relative z-20 inline-block text-left">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-2 rounded-full hover:bg-black/10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="3" r="1.5" fill="currentColor" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            <circle cx="8" cy="13" r="1.5" fill="currentColor" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-30 py-1 text-sm text-gray-700">
              <button
                onClick={() => handleOptionClick("share")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                Share Course
              </button>

              {canEdit && (
                <button
                  onClick={() => handleOptionClick("edit")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  Edit Course
                </button>
              )}

              {canDelete && (
                <button
                  onClick={() => handleOptionClick("delete")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-red-600"
                >
                  Delete Course
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 9V5M10 13h.01M10 18a8 8 0 100-16 8 8 0 000 16z"
                    stroke="#DC2626"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Course
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">
              Are you sure you want to delete{" "}
              <strong>&quot;{courseName}&quot;</strong>?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete Course"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MoreOptionsMenu;
