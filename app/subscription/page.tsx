import { PricingTable } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const Subscription = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return (
    <main className="flex flex-col items-center min-h-screen">
      <PricingTable />
    </main>
  );
};

export default Subscription;
