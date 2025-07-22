"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  Layers,
  Calendar,
} from "lucide-react";
import ClientPaymentWrapper from "./PaymentWrap";
import Link from "next/link";

type Unit = {
  id: string;
  title: string;
};

type Section = {
  id: string;
  title: string;
  description: string;
  units: Unit[];
};

type Companion = {
  name: string;
  title: string;
  subject: string;
  level?: string;
  duration?: string;
  price: number;
  category?: string;
  id: string;
  learnings?: string[];
};

type Props = {
  companion: Companion;
  sections: Section[];
  courseAccess: boolean;
};

const CoursePage = ({ companion, sections, courseAccess }: Props) => {
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  console.log(courseAccess);
  const toggleSection = (id: string) => {
    setOpenSectionId(openSectionId === id ? null : id);
  };

  const totalUnits = sections.reduce((acc, sec) => acc + sec.units.length, 0);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-10">
      {/* Course Header */}
      <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {companion.title}
          </h1>
          <p className="text-lg text-gray-600">{companion.subject}</p>
          <p className="text-sm text-gray-500 mt-1">
            Instructor: {companion.name}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-600 mt-4">
          {companion.level && (
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-purple-500" />
              <span>Level: {companion.level}</span>
            </div>
          )}
          {companion.duration && (
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-purple-500" />
              <span>Duration: {companion.duration}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-purple-500" />
            <span>
              {sections.length} Sections · {totalUnits} Units
            </span>
          </div>
          {!courseAccess ? (
            <ClientPaymentWrapper
              id={companion.id}
              price={companion.price}
              courseName={companion.name}
            />
          ) : (
            <Link
              href={`/companions/${companion.id}/${sections[0].units[0].id}`}
              className="w-full"
            >
              <button className="btn-primary w-full justify-center">
                Launch Lesson
              </button>
            </Link>
          )}
        </div>

        {companion.learnings && companion.learnings.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-2 text-lg">
              What you’ll learn
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {companion.learnings.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Curriculum */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Course Content
        </h2>
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="border border-gray-300 rounded-xl overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full bg-gray-50 hover:bg-gray-100 px-6 py-4 text-left flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
                {openSectionId === section.id ? (
                  <ChevronUp className="text-gray-500" />
                ) : (
                  <ChevronDown className="text-gray-500" />
                )}
              </button>

              {/* Units */}
              {openSectionId === section.id && (
                <ul className="bg-white divide-y divide-gray-200">
                  {section.units.map((unit) => (
                    <li
                      key={unit.id}
                      className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      <BookOpen size={16} className="text-purple-500" />
                      <span className="text-sm">{unit.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default CoursePage;
