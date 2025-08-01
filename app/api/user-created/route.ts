// app/api/user-created/route.ts

import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body: WebhookEvent = await req.json();

    if (body.type !== "user.created") {
      return NextResponse.json({ message: "Ignored non-user.created event" });
    }

    const userId = body.data.id;

    // 🔍 Fetch full user data to get email
    const user = await clerkClient.users.getUser(userId);

    const email = user.emailAddresses?.[0]?.emailAddress || "";

    // ✅ Update public metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "user",
        email,
        joined: new Date().toISOString(),
      },
    });

    console.log(`✅ Updated metadata for ${userId}`);
    return NextResponse.json({ message: "User metadata updated" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
