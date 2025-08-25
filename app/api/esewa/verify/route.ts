import { NextResponse } from "next/server";
import { storePaymentInfo, storeSubscriptionInfo, upgradeToPremium } from "@/lib/db/queries";

export async function POST(req: Request) {
  try {
    const { total_amount, transaction_uuid, product_code, userId, plan, amount } = await req.json();

    if (!userId || !plan || !amount || !transaction_uuid || !product_code) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (!["weekly", "monthly", "yearly"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    const url = `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=${product_code}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;
    const verifyRes = await fetch(url);
    const result = await verifyRes.json();

    if (result.status === "COMPLETE") {
      // Store payment info
      await storePaymentInfo(userId, {
        amount: parseInt(amount),
        method: "esewa",
        status: "completed",
        transactionId: transaction_uuid,
        transactionCode: transaction_uuid,
      });

      // Store subscription info
      await storeSubscriptionInfo(userId, { plan });

      // Upgrade user to premium
      await upgradeToPremium(userId);

      return NextResponse.json({ success: true, data: result });
    } else {
      // Store failed payment
      await storePaymentInfo(userId, {
        amount: parseInt(amount),
        method: "esewa",
        status: "failed",
        transactionId: transaction_uuid,
        transactionCode: transaction_uuid,
      });

      return NextResponse.json({ success: false, data: result });
    }
  } catch (err) {
    console.error("Esewa verify error:", err);
    return NextResponse.json({ success: false, message: "Verification error" }, { status: 500 });
  }
}