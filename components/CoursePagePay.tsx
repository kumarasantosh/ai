"use server";
import { CoursePermission } from "@/lib/action/companion.action";
import CoursePage from "./CoursePage";

type Props = {
  companion: Companion;
  sections: Section[];
};

const CoursePageWrapper = async ({ companion, sections }: Props) => {
  const courseAccess = await CoursePermission(companion.id);

  return (
    <CoursePage
      companion={companion}
      sections={sections}
      courseAccess={courseAccess}
    />
  );
};

export default CoursePageWrapper;
