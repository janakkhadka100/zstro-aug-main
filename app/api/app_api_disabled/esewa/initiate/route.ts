import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, plan, success_url } = await req.json();

    if (!["weekly", "monthly", "yearly"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    const total_amount = amount;
    const transaction_uuid = Date.now().toString();
    const product_code = "EPAYTEST";
    const product_service_charge = 0;
    const product_delivery_charge = 0;
    const tax_amount = 0;

    const signed_field_names = "total_amount,transaction_uuid,product_code";
    const signed_string = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const secret = process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(signed_string)
      .digest("base64");

    // Ensure success_url uses & for additional parameters
    const formattedSuccessUrl = `${success_url}${success_url.includes("?") ? "&" : "?"}userId=${userId}&amt=${amount}`;

    // Use base URL from env (fallback to localhost if missing)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.json({
      payment_url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
      params: {
        amount,
        tax_amount,
        total_amount,
        transaction_uuid,
        product_code,
        product_service_charge,
        product_delivery_charge,
        success_url: formattedSuccessUrl,
        failure_url: `${baseUrl}/upgrade`,
        signed_field_names,
        signature,
      },
    });
  } catch (err) {
    console.error("Esewa initiate error:", err);
    return NextResponse.json({ error: "Failed to initiate eSewa" }, { status: 500 });
  }
}
