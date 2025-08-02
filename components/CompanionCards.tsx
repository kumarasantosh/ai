import Image from "next/image";
import React from "react";
import Link from "next/link";
import {
  CoursePermission,
  getSectionsByCompanionId,
  getUnitsBySectionId,
} from "@/lib/action/companion.action";
import { auth, currentUser } from "@clerk/nextjs/server";
import ClientPaymentWrapper from "./PaymentWrap";
import MoreOptionsMenu from "./MoreOptionsMenu";
import CompanionCardClient from "./CompanionCardClient";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  price: number;
}

const CompanionCards = async ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  price,
}: CompanionCardProps) => {
  const CourseAccess = await CoursePermission(id);
  const { userId } = await auth();
  const user = await currentUser();
  const role = user?.publicMetadata?.role;

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

  return (
    <CompanionCardClient
      id={id}
      name={name}
      topic={topic}
      subject={subject}
      duration={duration}
      color={color}
      price={price}
      courseAccess={CourseAccess}
      userId={userId}
      role={role}
      units={units}
    />
  );
};

export default CompanionCards;
