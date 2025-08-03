"use client";

import {
  getUnit,
  getUnitSummary,
  upsertUnitSummary,
} from "@/lib/action/companion.action";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

interface SummaryProps {
  params: Promise<{ id: string; sid: string }>;
}

export default function ContentGenerator({ params }: SummaryProps) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [customPrompt, setCustomPrompt] = useState("");
  const [paramData, setParamData] = useState<{
    id: string;
    sid: string;
  } | null>(null);

  const { user } = useUser();
  const role = user?.publicMetadata?.role;

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setParamData(resolvedParams);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    // Store original styles
    const originalBodyBackground = body.style.background;
    const originalBodyBackgroundColor = body.style.backgroundColor;
    const originalBodyBackgroundImage = body.style.backgroundImage;

    // Add a class to body instead of directly manipulating styles
    body.classList.add("session-page");

    // Create a style element for this specific page
    const styleElement = document.createElement("style");
    styleElement.id = "session-page-styles";
    styleElement.textContent = `
      body.session-page {
        background: none !important;
        background-color: transparent !important;
        background-image: none !important;
      }
      
      /* Ensure navigation text remains visible */
      body.session-page nav,
      body.session-page header,
      body.session-page h1,
      body.session-page .nav-text {
        color: black !important;
      }
      
      /* If you have specific navigation selectors, add them here */
      body.session-page [data-nav="true"],
      body.session-page .navigation,
      body.session-page .navbar {
        color: var(--text-primary, #000) !important;
      }
    `;

    document.head.appendChild(styleElement);

    // Cleanup function
    return () => {
      body.classList.remove("session-page");
      const styleEl = document.getElementById("session-page-styles");
      if (styleEl) {
        styleEl.remove();
      }

      // Restore original styles
      body.style.background = originalBodyBackground;
      body.style.backgroundColor = originalBodyBackgroundColor;
      body.style.backgroundImage = originalBodyBackgroundImage;
    };
  }, []);

  const hasValidSummary = (summaryContent: any): boolean => {
    if (!summaryContent) return false;
    if (typeof summaryContent === "string") {
      return (
        summaryContent.trim().length > 10 &&
        summaryContent.trim() !== "No summary available"
      );
    }
    if (typeof summaryContent === "object" && summaryContent.summary) {
      return (
        summaryContent.summary.trim().length > 10 &&
        summaryContent.summary.trim() !== "No summary available"
      );
    }
    return false;
  };

  const generateSummary = async (title: string, prompt: string) => {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ingestedData: { title, prompt },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate summary");
    }

    const data = await response.json();
    return data.content;
  };

  useEffect(() => {
    const loadSummary = async () => {
      if (!paramData) return;

      try {
        const { id: companionId, sid: unitId } = paramData;

        const [existingSummary] = await getUnitSummary(unitId);
        if (hasValidSummary(existingSummary)) {
          let summaryText;
          if (typeof existingSummary === "string") {
            summaryText = existingSummary;
          } else if (existingSummary && existingSummary.summary) {
            summaryText = existingSummary.summary;
          } else {
            summaryText = JSON.stringify(existingSummary);
          }

          setSummary(summaryText);
          return;
        }

        const [{ title, prompt }] = await getUnit(unitId);

        const generatedSummary = await generateSummary(title, prompt);
        setSummary(generatedSummary);

        await upsertUnitSummary({
          companionId,
          unitId,
          summaryContent: generatedSummary,
          unitTitle: title,
          originalContent: prompt,
        });
      } catch (error) {
        console.error("Error loading summary:", error);
        setSummary("Failed to load summary");
      } finally {
        setLoading(false);
      }
    };

    if (paramData?.sid) {
      loadSummary();
    }
  }, [paramData]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span>Loading summary...</span>
        </div>
      </div>
    );
  }

  function cleanHtmlResponse(rawResponse: string): string {
    const withoutLeadingFence = rawResponse.replace(/^```html\s*|^```\s*/i, "");
    const cleaned = withoutLeadingFence.replace(/```$/, "").trim();
    return cleaned;
  }

  const html = cleanHtmlResponse(summary);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {role === "admin" && (
        <div className="mb-6">
          <label className="block mb-2 font-semibold">
            Custom Prompt (Admin Only):
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-2"
            rows={4}
            placeholder="Enter a custom prompt to regenerate the summary..."
          />
          <button
            onClick={async () => {
              if (!paramData || customPrompt.trim() === "") return;
              setLoading(true);
              try {
                const { id: companionId, sid: unitId } = paramData;
                const [{ title }] = await getUnit(unitId);
                const generated = await generateSummary(title, customPrompt);
                setSummary(generated);

                await upsertUnitSummary({
                  companionId,
                  unitId,
                  summaryContent: generated,
                  unitTitle: title,
                  originalContent: customPrompt,
                });
              } catch (error) {
                console.error("Regeneration error:", error);
                setSummary("Failed to regenerate summary.");
              } finally {
                setLoading(false);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Generate with Custom Prompt
          </button>
        </div>
      )}

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
