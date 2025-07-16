import CardList from "@/components/CardList";
import CompanionCards from "@/components/CompanionCards";
import CTA from "@/components/CTA";
import {
  getallcompanions,
  getRecentSessions,
} from "@/lib/action/companion.action";
import React from "react";

const Page = async () => {
  const companions = await getallcompanions({ limit: 2 });
  const resentSessionCompanion = await getRecentSessions();
  return (
    <main>
      <h1 className="text-2xl underline">Popular Companions</h1>
      <section className="home-section">
        <CompanionCards
          id="b04a7e47-f41d-43e4-9c88-3ffe9d496e20"
          name="Object Oriented Programming Through Java Laboratory"
          topic="CO-1: Write the programs for solving real world problems using Java OOP principles|CO-2: Write programs using Exceptional Handling approach|CO-3: Write multithreaded applications|CO-4: Build application using Java collection framework|CO-5: Develop Java applications connected to databases using JDBC"
          subject="Computer Science / Programming Lab"
          duration={1}
          color="#C8FFDF"
        />
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
