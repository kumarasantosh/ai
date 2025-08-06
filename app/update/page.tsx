// app/update/page.tsx
import PageStyleManager from "@/components/PageStyle";
import UpdateForm from "@/components/Updateform";
import {
  getCompanion,
  getSectionsByCompanionId,
  getUnitsBySectionId,
} from "@/lib/action/companion.action";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface SearchParams {
  searchParams: {
    courseid: string;
  };
}

const Page = async ({ searchParams }: SearchParams) => {
  const id = searchParams.courseid;
  const user = await currentUser();

  if (user?.publicMetadata?.role !== "admin") redirect("/");
  if (!id) return <div>Missing courseid</div>;

  const companion = await getCompanion(id);
  const sections = await getSectionsByCompanionId(id);

  const populatedSections = await Promise.all(
    sections.map(async (section) => {
      const units = await getUnitsBySectionId(section.id);
      return {
        ...section,
        units,
      };
    })
  );

  const courseData = {
    id,
    name: companion.name,
    subject: companion.subject,
    topic: companion.topic,
    voice: companion.voice,
    style: companion.style,
    duration: companion.duration,
    price: companion.price,
    teacher_name: companion.teacher_name ?? "",
    sections: populatedSections.map((sec) => ({
      title: sec.title,
      description: sec.description || "",
      units: sec.units.map((unit) => ({
        title: unit.title,
        content: unit.content || "",
        prompt: unit.prompt || "",
      })),
    })),
  };

  return (
    <>
      <PageStyleManager />
      <UpdateForm defaultValues={courseData} mode="update" />
    </>
  );
};

export default Page;
