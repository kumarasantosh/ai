import CompanionForm from "@/components/CompanionForm";
import { Button } from "@/components/ui/button";
import { newCampanionPermission } from "@/lib/action/companion.action";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import React from "react";

const New = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const canCreateCompanion = await newCampanionPermission();
  return (
    <main className="min-lg:w-1/3 min-wd:w-2/3 items-center justify-center">
      {canCreateCompanion ? (
        <article className="w-full gap-4 flex flex-col">
          <h1>Companion Builder</h1>
          <CompanionForm />
        </article>
      ) : (
        <article className="companion-limit">
          <h1>Upgrade Your Plan</h1>
          <Button>
            <Link href="/subscription">Upgrade Now</Link>
          </Button>
        </article>
      )}
    </main>
  );
};

export default New;
