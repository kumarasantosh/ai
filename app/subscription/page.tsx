import { PricingTable } from "@clerk/nextjs";
import React from "react";

const Subscription = () => {
  return (
    <main className="flex flex-col items-center min-h-screen">
      <PricingTable />
    </main>
  );
};

export default Subscription;
