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
      <section className="home-section">
        {companions.map((companion) => (
          <CompanionCards
            key={companion.id}
            {...companion}
            color={companion.color}
          /> //
        ))}
        {role === "admin" ? <CTA /> : ""}
      </section>
    </main>
  );
};

export default Page;
