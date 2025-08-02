import { Bricolage_Grotesque } from "next/font/google";
import Script from "next/script";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Study - Learn and Grow",
  description: "Your learning platform powered by Next.js and Clerk",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: "#fe5933",
        },
        elements: {
          formButtonPrimary: "bg-[#fe5933] hover:bg-[#e54d2e]",
          card: "shadow-lg",
        },
      }}
    >
      <html lang="en">
        <body className={`${bricolage.variable} antialiased`}>
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="beforeInteractive"
          />
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
