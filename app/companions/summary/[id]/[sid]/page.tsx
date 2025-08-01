"use client";

import {
  getUnit,
  getUnitSummary,
  upsertUnitSummary,
} from "@/lib/action/companion.action";

import React, { useState, useEffect } from "react";

interface SummaryProps {
  params: Promise<{ id: string; sid: string }>;
}

export default function ContentGenerator({ params }: SummaryProps) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [paramData, setParamData] = useState<{
    id: string;
    sid: string;
  } | null>(null);

  // Resolve params when component mounts
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setParamData(resolvedParams);
    };
    resolveParams();
  }, [params]);

  // Check if unit summary has meaningful content
  const hasValidSummary = (summaryContent: any): boolean => {
    if (!summaryContent) return false;

    // Handle string content
    if (typeof summaryContent === "string") {
      return (
        summaryContent.trim().length > 10 &&
        summaryContent.trim() !== "No summary available"
      );
    }

    // Handle object content with summary property
    if (typeof summaryContent === "object" && summaryContent.summary) {
      return (
        summaryContent.summary.trim().length > 10 &&
        summaryContent.summary.trim() !== "No summary available"
      );
    }

    return false;
  };

  // Generate summary using AI
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

  // Load unit data and handle summary
  useEffect(() => {
    const loadSummary = async () => {
      if (!paramData) return;

      try {
        const { id: companionId, sid: unitId } = paramData;

        // 1. Get existing summary first
        const [existingSummary] = await getUnitSummary(unitId);
        console.log("Existing summary:", existingSummary); // Debug log

        // 2. Check if summary exists and extract the text
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

        // 3. No valid summary exists, get unit data to generate one
        const [{ title, prompt }] = await getUnit(unitId);
        console.log("Unit data for generation:", { title, prompt }); // Debug log

        // 4. Generate new summary only if no existing summary
        const generatedSummary = await generateSummary(title, prompt);
        setSummary(generatedSummary);

        // 5. Save generated summary to database
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
    // Remove leading ```html or ```
    const withoutLeadingFence = rawResponse.replace(/^```html\s*|^```\s*/i, "");

    // Remove trailing ``` (only if it's on its own line or at the end)
    const cleaned = withoutLeadingFence.replace(/```$/, "").trim();

    return cleaned;
  }
  const html = cleanHtmlResponse(summary);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
