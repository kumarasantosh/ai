import CompanionComponent from "@/components/CompanionComponent";
import {
  CoursePermission,
  getCompanion,
  getSectionsByCompanionId,
  getUnit,
  getUnitsBySectionId,
} from "@/lib/action/companion.action";
import { currentUser } from "@clerk/nextjs/server";

interface CompanionSessionPageProps {
  params: Promise<{ id: string; sid: string }>;
}
const SessionCompanionWithUnits = async ({
  params,
}: CompanionSessionPageProps) => {
  const { id, sid } = await params;
  const companion = await getCompanion(id);
  const sections = await getSectionsByCompanionId(id);
  const units = await Promise.all(
    sections.map(async (section) => {
      const unitsForSection = await getUnitsBySectionId(section.id);
      return {
        ...section,
        units: unitsForSection,
      };
    })
  );
  const currUnit = await getUnit(sid);

  const user = await currentUser();
  const courseAccess = await CoursePermission(id);
  const { name, subject, title, topic, duration } = companion;
  console.log(units);
  if (!user) {
    return <div>Please sign in to view this page.</div>;
  }
  if (!companion) {
    return <div className="font-bold">Companion not found.</div>;
  }
  if (!courseAccess) {
    return (
      <main>
        <h1>You Dont have Access to this course</h1>
      </main>
    );
  }
  return (
    <main>
      <article className="flex rounded-border justify-between p-6 max-md:fkex-col">
        <div className="flex items-center gap-2">
          <div
            className="size-[72px] flex items-center justify-center rounded-lg max-md:hidden"
            style={{
              backgroundColor: companion.color,
            }}
          ></div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="font-bold text-2xl">{companion.name}</p>
              <div className="subject-badge max-sm:hidden">
                {companion.subject}
              </div>
            </div>
            <p className="text-lg text-[#808080]">{currUnit[0].title}</p>
          </div>
        </div>
        <div className="items-start text-2xl max-md:hidden">
          {companion.duration} {companion.duration > 10 ? "minutes" : "hour"}
        </div>
      </article>
      <CompanionComponent
        {...companion}
        unit={currUnit}
        companion={companion}
        sections={units}
        companionId={id}
        userName={user.firstName!}
        userImage={user.imageUrl!}
      />
    </main>
  );
};

export default SessionCompanionWithUnits;
