import { clerkClient, WebhookEvent } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body: WebhookEvent = await req.json();
    console.log("📨 Webhook event received:", JSON.stringify(body, null, 2));

    if (body.type !== "user.created") {
      return NextResponse.json({ message: "Ignored non-user.created event" });
    }

    const userId = body.data.id;
    console.log("🔍 Fetching user with ID:", userId);

    const user = await clerkClient.users.getUser(userId);
    console.log("✅ User data fetched:", JSON.stringify(user, null, 2));

    const email = user.emailAddresses?.[0]?.emailAddress || "";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(futureDate.getDate() + 7);

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "user",
        email,
        name: `${firstName} ${lastName}`.trim(),
        joined: new Date().toISOString(),
        freetrailend: futureDate.toISOString().split("T")[0],
      },
    });

    console.log(`🎉 Metadata updated for user: ${userId}`);
    return NextResponse.json({ message: "User metadata updated" });
  } catch (error: any) {
    console.error("❌ Webhook handler error:", error?.message || error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 }
    );
  }
}
