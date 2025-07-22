import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
interface CompanionListProps {
  title: string;
  companions?: Companion[];
  className?: string;
}
const CardList = ({ title, companions, className }: CompanionListProps) => {
  return (
    <article className={cn("companion-list", className)}>
      <h2 className="text-3xl font-semibold">Recent Sessions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-lg w-2/3">Lesson</TableHead>
            <TableHead className="text-lg">Status</TableHead>
            <TableHead className="text-lg text-right">Method</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companions?.map((i, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <Link href={`/companions/details/${i.id}`}>
                  <div className="flex items-center gap-2">
                    <div
                      className="size-[72px] flex items-center justify-center rounded-lg max-md:hidden"
                      style={{
                        backgroundColor: i.color,
                      }}
                    >
                      <h4>{index + 1}</h4>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="font-bold text-2xl">
                        {`${i.name.substring(0, 20)}...`}
                      </p>
                      <p className="text-lg">{i.subject}</p>
                    </div>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <div className="subject-badge w-fit max-md:hidden">
                  {i.subject.split("/")[0]}
                </div>
                <div
                  className="flex items-center justify-content rounded-lg w-fit p-2 md:hidden"
                  style={{ backgroundColor: i.color }}
                >
                  <Image
                    width={18}
                    height={18}
                    src={`/icons/${i.subject}.svg`}
                    alt=""
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 w-full justify-end">
                  <p className="text-2xl">
                    {i.duration}
                    <span className="max-md:hidden">
                      {i.duration > 10 ? "minutes" : "hours"}
                    </span>
                  </p>
                  <Image
                    src="/icons/clock.svg"
                    alt=""
                    width={15}
                    height={15}
                    className="md:hidden"
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  );
};

export default CardList;
