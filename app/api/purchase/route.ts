import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  console.log("=== PURCHASE ENDPOINT STARTED ===");

  try {
    // Check auth
    const { userId } = await auth();
    console.log("Auth result:", { userId });

    if (!userId) {
      console.log("No userId - returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
      console.log("Request body:", requestBody);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { companionId, price, paymentId, orderId } = requestBody;

    // Validate required fields
    const missingFields = [];
    if (!companionId) missingFields.push("companionId");
    if (!price) missingFields.push("price");
    if (!paymentId) missingFields.push("paymentId");
    if (!orderId) missingFields.push("orderId");

    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      return NextResponse.json(
        { error: "Missing data", missingFields },
        { status: 400 }
      );
    }

    // Test Supabase connection
    console.log("Creating Supabase client...");
    const supabase = createSupabaseServerClient();
    console.log("Supabase client created");

    // Test connection with a simple query
    console.log("Testing Supabase connection...");
    const { data: testData, error: testError } = await supabase
      .from("users")
      .select("id")
      .limit(1);

    if (testError) {
      console.error("Supabase connection test failed:", testError);
      return NextResponse.json(
        { error: "Database connection failed", details: testError.message },
        { status: 500 }
      );
    }
    console.log("Supabase connection test passed");

    // Try user upsert
    console.log("Attempting user upsert...");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert({
        id: userId,
        created_at: new Date().toISOString(),
      })
      .select();

    if (userError) {
      console.error("User upsert failed:", userError);
      return NextResponse.json(
        { error: "Failed to create user", details: userError.message },
        { status: 500 }
      );
    }
    console.log("User upsert successful:", userData);

    // Try purchase insert
    console.log("Attempting purchase insert...");
    const purchaseData = {
      user_id: userId,
      companion_id: companionId,
      price_at_purchase: price.toString(),
      payment_id: paymentId,
      order_id: orderId,
      purchased_at: new Date().toISOString(),
      access_expires_at: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    console.log("Purchase data to insert:", purchaseData);

    const { data: purchaseResult, error: purchaseError } = await supabase
      .from("purchases")
      .insert(purchaseData)
      .select();

    if (purchaseError) {
      console.error("Purchase insert failed:", purchaseError);
      return NextResponse.json(
        { error: "Failed to record purchase", details: purchaseError.message },
        { status: 500 }
      );
    }

    console.log("Purchase insert successful:", purchaseResult);
    console.log("=== PURCHASE ENDPOINT COMPLETED SUCCESSFULLY ===");

    return NextResponse.json(
      {
        message: "Purchase recorded",
        purchaseId: purchaseResult[0]?.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("=== UNEXPECTED ERROR ===");
    console.error("Error type:", typeof error);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : error
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    console.error("Raw error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
