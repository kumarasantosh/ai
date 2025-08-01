// app/api/user-created/route.ts
import { WebhookEvent } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body: WebhookEvent = await req.json();

    if (body.type !== "user.created") {
      return NextResponse.json({ message: "Not a user.created event" });
    }

    const { id: userId, email_addresses } = body.data;

    const email = email_addresses?.[0]?.email_address || "";

    // ✅ Example: set public metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "user",
        email,
        joined: new Date().toISOString(),
      },
    });

    return NextResponse.json({ message: "Metadata updated" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
