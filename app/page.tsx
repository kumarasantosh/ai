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
    <main>
      <h1 className="text-2xl underline">Suggested For You</h1>
      <section className="home-section">
        {companions.map((companion) => (
          <CompanionCards
            key={companion.id}
            {...companion}
            color={companion.color}
          /> //
        ))}
      </section>
      <h1>Trending Courses</h1>
      <section className="home-section w-full max-w-7xl items-center mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Companions Grid */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-max">
              {Allcompanions.map((companion) => (
                <div key={companion.id} className="flex justify-center">
                  <CompanionCards {...companion} color={companion.color} />
                </div>
              ))}
            </div>
          </div>

          {/* CTA Sidebar */}
          {role === "admin" && (
            <div className="lg:w-90 lg:flex-shrink-0">
              <div className="lg:sticky lg:top-8">
                <CTA />
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Page;
