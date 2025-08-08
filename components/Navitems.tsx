"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navitems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Companions",
    href: "/companions",
  },
  {
    label: "Orders",
    href: "/orders",
  },
  {
    label: "Recent Sessions",
    href: "/history",
  },
];
const Navitems = () => {
  const pathname = usePathname();
  return (
    <nav
      className="flex flex-col md:flex-row
 items-center gap-4 sm:flex-col sm:items-end"
    >
      {navitems.map(({ label, href }) => (
        <Link
          href={href}
          key={label}
          className={cn(
            pathname === href && "text-white underline font-extrabold "
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default Navitems;
