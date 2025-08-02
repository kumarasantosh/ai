"use client";

import React, { useState } from "react";
import Link from "next/link";
import MoreOptionsMenu from "./MoreOptionsMenu";
import { Clock, Play, Eye, LogIn, Star, BookOpen } from "lucide-react";

interface CompanionCardClientProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  price: number;
  courseAccess: boolean;
  userId: string | null;
  role: any;
  units: any;
}

const CompanionCardClient = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  price,
  courseAccess,
  userId,
  role,
  units,
}: CompanionCardClientProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const totalUnits = units.reduce((acc, sec) => acc + sec.units.length, 0);

  return (
    <article
      className={`relative w-80 h-96 rounded-2xl overflow-hidden shadow-xl transition-all duration-500 transform ${
        isHovered ? "scale-105 shadow-2xl" : ""
      }`}
      style={{ background: color }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

      {/* Animated background pattern */}
      <div
        className={`absolute inset-0 opacity-20 transition-transform duration-700 ${
          isHovered ? "scale-110" : ""
        }`}
      >
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </div>

      {/* Card content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 flex-1 pr-2">
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-white text-xs font-medium">
                {subject.split("/")[0]}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-300 fill-current" />
              <span className="text-white/80 text-xs">4.8</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Price tag */}
            {!courseAccess && userId && (
              <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                ₹{price}
              </div>
            )}
            <MoreOptionsMenu courseId={id} courseName={name} role={role} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-white text-xl font-bold mb-3 leading-tight">
          {name}
        </h2>

        {/* Description */}
        <p className="text-white/90 text-sm line-clamp-4 mb-4 leading-relaxed">
          {topic}
        </p>

        {/* Course metadata */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-white/80">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              {duration} hour{duration !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">{totalUnits} lessons</span>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-auto">
          {userId ? (
            courseAccess ? (
              <Link href={`/companions/details/${id}`} className="w-full">
                <button
                  className={`group w-full bg-white text-gray-900 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:bg-green-400 hover:shadow-lg hover:shadow-green-400/25 active:scale-95 ${
                    isHovered ? "transform translate-y-[-2px]" : ""
                  }`}
                >
                  <Play className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  Launch Lesson
                </button>
              </Link>
            ) : (
              <Link href={`/companions/details/${id}`} className="w-full">
                <button
                  className={`group w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:bg-white/20 hover:border-white/40 hover:shadow-lg hover:shadow-white/10 active:scale-95 ${
                    isHovered ? "transform translate-y-[-2px]" : ""
                  }`}
                >
                  <Eye className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  View Course
                </button>
              </Link>
            )
          ) : (
            <Link href="/sign-in" className="w-full">
              <button
                className={`group w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:from-pink-600 hover:to-violet-600 hover:shadow-lg hover:shadow-pink-500/25 active:scale-95 ${
                  isHovered ? "transform translate-y-[-2px]" : ""
                }`}
              >
                <LogIn className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                Login Now
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Floating elements */}
      <div
        className={`absolute top-4 left-4 w-2 h-2 bg-white/60 rounded-full transition-all duration-1000 ${
          isHovered ? "animate-pulse" : ""
        }`}
      />
      <div
        className={`absolute bottom-8 right-8 w-1 h-1 bg-white/40 rounded-full transition-all duration-1000 delay-200 ${
          isHovered ? "animate-pulse" : ""
        }`}
      />
    </article>
  );
};

export default CompanionCardClient;
