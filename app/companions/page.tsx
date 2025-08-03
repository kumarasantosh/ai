import CompanionCards from "@/components/CompanionCards";
import Srch from "@/components/Srch";
import { getallcompanions } from "@/lib/action/companion.action";
import React from "react";

const CompanionLibrary = async ({ searchParams }: SearchParams) => {
  const filters = await searchParams;
  const subject = filters.subject;
  const topic = filters.topic;
  const companions = await getallcompanions({ subject, topic });
  return (
    <main className="bg-dark-space text-gray-300 flex items-center">
      <section className="flex justify-between gap-4 max-sm:flex-col">
        <h1>All Courses</h1>
        <div className="flex gap-4">
          <Srch />
        </div>
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {companions.map((companion) => (
          <CompanionCards
            key={companion.id}
            {...companion}
            color={companion.color}
          />
        ))}
      </section>
    </main>
  );
};

export default CompanionLibrary;
