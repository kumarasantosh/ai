"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Navitems from "./Navitems";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration mismatch by ensuring component only renders after mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Don't render auth components until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <nav className="navbar bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left Corner */}
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Study
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation - Right Corner */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-white">
                <Navitems />
              </div>
              <div className="ml-4">
                {/* Placeholder during hydration */}
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-2.5 rounded-lg font-medium opacity-50">
                  Loading...
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-white p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Toggle menu"
                type="button"
              >
                <svg
                  className="w-6 h-6 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
      <div className="w-full px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left Corner */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <h1 className="text-2xl font-bold text-white tracking-wide">
                Study
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation - Right Corner */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-white">
              <Navitems />
            </div>
            <div className="ml-4" suppressHydrationWarning>
              <SignedOut>
                <SignInButton>
                  <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-2.5 rounded-lg hover:bg-white/30 transition-all duration-200 font-medium">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={`text-white p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                isMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              aria-label="Toggle menu"
              type="button"
            >
              <svg
                className="w-6 h-6 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Fullscreen Blur */}
        {isMounted && (
          <div
            className={`md:hidden fixed inset-0 z-50 backdrop-blur-lg bg-black/20 transition-all duration-300 ease-in-out ${
              isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
            onClick={toggleMenu}
            style={{ height: "100vh", width: "100vw" }}
          >
            {/* Close Button - Outside content container */}
            <button
              onClick={toggleMenu}
              className="absolute top-6 right-6 text-white p-3 rounded-lg bg-white/30 border border-white/40 hover:bg-white/40 transition-colors duration-200 z-50 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close menu"
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Menu Content - Full Viewport */}
            <div
              className="h-full w-full flex flex-col justify-center items-center px-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Items - Vertical Stack */}
              <div className="flex flex-col justify-center items-center space-y-8 text-white text-center">
                <div className="text-xl font-medium">
                  <Navitems />
                </div>

                {/* Auth Section */}
                <div className="mt-12" suppressHydrationWarning>
                  <SignedOut>
                    <SignInButton>
                      <button
                        className="bg-white/30 border border-white/40 text-white px-10 py-4 rounded-lg hover:bg-white/40 transition-all duration-200 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                        type="button"
                      >
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <div className="scale-125">
                      <UserButton />
                    </div>
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
