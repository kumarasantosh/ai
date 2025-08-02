export const dynamic = "force-dynamic";

import Link from "next/link";
import React from "react";
import Navitems from "./Navitems";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link href="/">
        <div className="flex items-center gap-2.5 cursor-pointer">
          <h1>Study</h1>
        </div>
      </Link>
      <div className="flex items-center gap-8">
        <Navitems />
        <header>
          <SignedOut>
            <SignInButton>
              <button className="btn-signin">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
      </div>
    </nav>
  );
};

export default Navbar;
