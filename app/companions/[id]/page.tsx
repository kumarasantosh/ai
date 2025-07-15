import CompanionComponent from "@/components/CompanionComponent";
import { getCompanion } from "@/lib/action/companion.action";
import { getSubjectColor } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import React from "react";

interface CompanionSessionPageProps {
  params: Promise<{ id: string }>;
}
const SessionCompanion = async ({ params }: CompanionSessionPageProps) => {
  const { id } = await params;
  const companion = await getCompanion(id);
  const user = await currentUser();
  const { name, subject, title, topic, duration } = companion;
  if (!user) {
    return <div>Please sign in to view this page.</div>;
  }
  if (!companion) {
    return <div>Companion not found.</div>;
  }
  return (
    <main>
      <article className="flex rounded-border justify-between p-6 max-md:fkex-col">
        <div className="flex items-center gap-2">
          <div
            className="size-[72px] flex items-center justify-center rounded-lg max-md:hidden"
            style={{
              backgroundColor: getSubjectColor(companion.subject.trim()),
            }}
          >
            <Image
              width={32}
              height={32}
              src={`/icons/${companion.subject.trim()}.svg`}
              alt=""
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="font-bold text-2xl">{companion.name}</p>
              <div className="subject-badge max-sm:hidden">
                {companion.subject}
              </div>
            </div>
            <p className="text-lg text-[#808080]">{companion.topic}</p>
          </div>
        </div>
        <div className="items-start text-2xl max-md:hidden">
          {companion.duration} minutes
        </div>
      </article>
      <CompanionComponent
        {...companion}
        companionId={id}
        userName={user.firstName!}
        userImage={user.imageUrl!}
      />
    </main>
  );
};

export default SessionCompanion;
