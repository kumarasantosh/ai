import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body: WebhookEvent = await req.json();

    // We only handle user.created event
    if (body.type !== "user.created") {
      return NextResponse.json({ message: "Ignored non-user.created event" });
    }

    const userId = body.data.id;

    // 🔍 Fetch full user data from Clerk
    const user = await clerkClient.users.getUser(userId);

    // 📧 Get the email safely
    const email = user.emailAddresses?.[0]?.emailAddress || "";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    // 📝 Update metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "user",
        email,
        name: `${firstName} ${lastName}`.trim(),
        joined: new Date().toISOString(),
      },
    });

    console.log(`✅ Updated metadata for ${userId}`);
    return NextResponse.json({ message: "User metadata updated" });
  } catch (error) {
    console.error("❌ Webhook handler error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
