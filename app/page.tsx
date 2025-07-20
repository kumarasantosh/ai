import CardList from "@/components/CardList";
import CompanionCards from "@/components/CompanionCards";
import CTA from "@/components/CTA";
import {
  getallcompanions,
  getRecentSessions,
} from "@/lib/action/companion.action";
import React from "react";

const Page = async () => {
  const companions = await getallcompanions({ limit: 3 });
  const resentSessionCompanion = await getRecentSessions();
  return (
    <main>
      <h1 className="text-2xl underline">Popular Companions</h1>
      <section className="home-section">
        {companions.map((companion) => (
          <CompanionCards
            key={companion.id}
            {...companion}
            color={companion.color}
          /> //
        ))}
      </section>
      <section className="home-section">
        <CardList
          title="Recently Completed Sessions"
          companions={resentSessionCompanion}
          className="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </main>
  );
};

export default Page;
