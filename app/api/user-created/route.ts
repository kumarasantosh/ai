// app/api/user-created/route.ts

import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = body?.data?.id;

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  // Auto-assign default role
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: "student", // default role
    },
  });

  return NextResponse.json({ success: true });
}
