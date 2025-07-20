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
];
const Navitems = () => {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-4">
      {navitems.map(({ label, href }) => (
        <Link
          href={href}
          key={label}
          className={cn(pathname === href && "text-primary underline")}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default Navitems;
