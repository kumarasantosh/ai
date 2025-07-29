import CoursePage from "@/components/CoursePage";
import CoursePageWrapper from "@/components/CoursePagePay";
import {
  getCompanion,
  getSectionsByCompanionId,
  getUnitsBySectionId,
} from "@/lib/action/companion.action";

interface CompanionDetailsProps {
  params: { id: string };
}

export default async function Page({ params }: CompanionDetailsProps) {
  const { id } = await params;
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

  return <CoursePageWrapper companion={companion} sections={units} />;
}
