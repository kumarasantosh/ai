import CardList from "@/components/CardList";
import { getRecentSessions } from "@/lib/action/companion.action";
import React from "react";

const page = async () => {
  const resentSessionCompanion = await getRecentSessions();
  console.log(resentSessionCompanion);
  return (
    <main>
      <section className="home-section">
        {resentSessionCompanion ? (
          <CardList
            title="Recently Completed Sessions"
            companions={resentSessionCompanion}
            className="w-[100%] max-lg:w-full"
          />
        ) : (
          <div>
            <h1>No recent Sessions</h1>
          </div>
        )}
      </section>
    </main>
  );
};

export default page;
