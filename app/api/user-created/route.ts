import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body: WebhookEvent = await req.json();
    console.log("📥 Webhook received:", JSON.stringify(body, null, 2));

    if (body.type !== "user.created") {
      return NextResponse.json({ message: "Ignored non-user.created event" });
    }

    const userId = body.data.id;
    console.log("👤 Getting user:", userId);

    const user = await clerkClient.users.getUser(userId);
    console.log("✅ Got user:", user);

    const email = user.emailAddresses?.[0]?.emailAddress || "";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
