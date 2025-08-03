import CardList from "@/components/CardList";
import CompanionCards from "@/components/CompanionCards";
import CTA from "@/components/CTA";
import {
  getallcompanions,
  getRecentSessions,
} from "@/lib/action/companion.action";
import { currentUser } from "@clerk/nextjs/server";

import React from "react";

const Page = async () => {
  const companions = await getallcompanions({ limit: 3 });
  const Allcompanions = await getallcompanions({ limit: 30 });
  const user = await currentUser();
  const role = user?.publicMetadata?.role;

  return (
    <main className="bg-dark-space text-gray-300">
      <div className="container mx-auto px-6">
        <h1 className="text-2xl underline mb-6">Suggested For You</h1>
        <section className="home-section mb-12">
          {companions.map((companion) => (
            <CompanionCards
              key={companion.id}
              {...companion}
              color={companion.color}
            />
          ))}
        </section>

        <h1 className="text-2xl mb-8">Trending Courses</h1>
        <section className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Companions Grid */}
            <div
              className={`${
                role === "admin" ? "lg:flex-1 lg:max-w-none" : "w-full"
              }`}
            >
              <div
                className={`grid gap-6 auto-rows-max ${
                  role === "admin"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
                }`}
              >
                {Allcompanions.map((companion) => (
                  <div key={companion.id} className="flex justify-center">
                    <CompanionCards {...companion} color={companion.color} />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Sidebar - Compact size */}
            {role === "admin" && (
              <div className="w-full lg:w-72 lg:min-w-72 lg:max-w-72 lg:flex-shrink-0">
                <div className="lg:sticky lg:top-24 h-fit">
                  <div className="w-full">
                    <CTA />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Page;
