"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";

// Lazy load heavy components
const CompanionComponent = dynamic(
  () => import("@/components/CompanionComponent"),
  {
    loading: () => (
      <div className="animate-pulse h-96 bg-gray-100 rounded"></div>
    ),
  }
);

import Loading from "@/components/Loading";
import {
  CoursePermission,
  getCompanion,
  getSectionsByCompanionId,
  getUnit,
  getUnitsBySectionId,
} from "@/lib/action/companion.action";

// Cache for API responses
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const SessionCompanionWithUnits = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Memoize params to prevent unnecessary re-renders
  const { id, sid } = useMemo(
    () => ({
      id: params.id as string,
      sid: params.sid as string,
    }),
    [params.id, params.sid]
  );

  // Optimized fetch function with caching and parallel requests
  const fetchData = useCallback(async () => {
    if (!id || !sid || !user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = `session-${id}-${sid}-${user.id}`;
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      // Step 1: Quick essential checks (parallel)
      const [companion, courseAccess, currUnit] = await Promise.all([
        getCompanion(id),
        CoursePermission(id),
        getUnit(sid),
      ]);

      // Early validation
      if (!companion) throw new Error("Course not found");
      if (!courseAccess) throw new Error("Access denied");
      if (!currUnit) throw new Error("Unit not found");

      // Step 2: Get sections (less critical)
      const sections = await getSectionsByCompanionId(id);

      // Step 3: Build units structure efficiently
      const units = await Promise.all(
        sections.slice(0, 5).map(async (section) => {
          // Limit to first 5 sections for performance
          const unitsForSection = await getUnitsBySectionId(section.id);
          return {
            ...section,
            units: unitsForSection,
          };
        })
      );

      const result = {
        companion,
        sections,
        units,
        currUnit,
        courseAccess: true,
      };

      // Cache the result
      setCachedData(cacheKey, result);
      setData(result);
    } catch (err: any) {
      console.error("Error loading course:", err);
      setError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [id, sid, user?.id]);

  // Debounced effect to prevent excessive API calls
  useEffect(() => {
    if (!isLoaded) return;

    const timeoutId = setTimeout(() => {
      fetchData();
    }, 50); // Small delay to batch rapid changes

    return () => clearTimeout(timeoutId);
  }, [isLoaded, fetchData]);

  // Optimized loading check
  const isLoading = !isLoaded || loading;

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6">
          <h1 className="text-xl font-bold text-red-600 mb-4">{error}</h1>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.companion) {
    return <Loading />;
  }

  const { companion, units, currUnit } = data;

  return (
    <main>
      {/* Header - render immediately */}
      <article className="flex rounded-border justify-between p-6 max-md:flex-col">
        <div className="flex items-center gap-2">
          <div
            className="size-[72px] flex items-center justify-center rounded-lg max-md:hidden transition-colors"
            style={{
              backgroundColor: companion.color || "#6b7280",
            }}
          ></div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-2xl">{companion.name}</h1>
              <div className="subject-badge max-sm:hidden">
                {companion.subject}
              </div>
            </div>
            <p className="text-lg text-[#808080]">
              {Array.isArray(currUnit) ? currUnit[0]?.title : currUnit?.title}
            </p>
          </div>
        </div>
        <div className="items-start text-2xl max-md:hidden">
          {companion.duration} {companion.duration > 10 ? "minutes" : "hour"}
        </div>
      </article>

      {/* Main component - lazy loaded */}
      <CompanionComponent
        {...companion}
        unit={currUnit}
        companion={companion}
        sections={units}
        companionId={id}
        userName={user?.firstName || "User"}
        userImage={user?.imageUrl || ""}
      />
    </main>
  );
};

export default SessionCompanionWithUnits;
