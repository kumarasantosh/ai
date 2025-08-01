import Image from "next/image";
import React from "react";
import Link from "next/link";
import { CoursePermission } from "@/lib/action/companion.action";
import { auth, currentUser } from "@clerk/nextjs/server";
import ClientPaymentWrapper from "./PaymentWrap";
import MoreOptionsMenu from "./MoreOptionsMenu";

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
  return (
    <article className="companion-card h-[350px]" style={{ background: color }}>
      <div className="flex justify-between items-center">
        <div className="subject-badge">{subject.split("/")[0]}</div>
        <MoreOptionsMenu courseId={id} courseName={name} role={role} />
      </div>
      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="line-clamp-5 text-sm">{topic}</p>
      <div className="flex items-center gap-2">
        <Image width={13.5} height={13.5} src="/icons/clock.svg" alt="" />
        <p className="textsm">{duration} hour</p>
      </div>
      {userId ? (
        CourseAccess ? (
          <Link href={`/companions/details/${id}`} className="w-full">
            <button className="btn-primary w-full justify-center">
              Launch Lesson
            </button>
          </Link>
        ) : (
          <Link href={`/companions/details/${id}`} className="w-full">
            <button className="btn-primary w-full justify-center">
              View Course
            </button>
          </Link>
        )
      ) : (
        <Link href="/sign-in" className="w-full">
          <button className="btn-primary w-full justify-center">
            Login Now
          </button>
        </Link>
      )}
    </article>
  );
};

export default CompanionCards;
