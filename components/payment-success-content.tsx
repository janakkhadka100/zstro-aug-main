"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState("Verifying payment...");

  // Manually parse query string to handle malformed URLs
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString.replace(/\?data=/, "&data=")); // Replace ?data with &data
  const pidx = urlParams.get("pidx"); // Khalti
  const esewaResponse = urlParams.get("data"); // eSewa Base64 JSON
  const plan = urlParams.get("plan"); // weekly, monthly, yearly
  const amount = urlParams.get("amt"); // Amount in NPR
  const userId = urlParams.get("userId"); // User ID
  const method = urlParams.get("method"); // Payment method

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!userId || !plan || !amount || !method) {
          setStatus("❌ Missing required parameters");
          console.error("Missing parameters:", { userId, plan, amount, method });
          return;
        }

        if (!["weekly", "monthly", "yearly"].includes(plan)) {
          setStatus("❌ Invalid plan type");
          console.error("Invalid plan:", plan);
          return;
        }

        if (method === "khalti" && pidx) {
          // Khalti verification
          const res = await fetch("/api/khalti/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pidx, userId, plan, amount: parseInt(amount) }),
          });
          const data = await res.json();
          if (data.success) {
            setStatus("✅ Khalti payment verified!");
          } else {
            setStatus("❌ Khalti verification failed");
          }
        } else if (method === "esewa" && esewaResponse) {
          // eSewa Base64 decode
          const decoded = JSON.parse(atob(esewaResponse));
          console.log("eSewa decoded:", decoded);

          if (decoded.status === "COMPLETE") {
            const res = await fetch("/api/esewa/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                total_amount: decoded.total_amount,
                transaction_uuid: decoded.transaction_uuid,
                product_code: decoded.product_code,
                userId,
                plan,
                amount: parseInt(amount),
              }),
            });

            const data = await res.json();
            if (data.success) {
              setStatus("✅ eSewa payment verified!");
            } else {
              setStatus("❌ eSewa verification failed");
            }
          } else {
            setStatus("❌ eSewa payment status: " + decoded.status);
          }
        } else {
          setStatus("❌ Invalid payment method or data");
          console.error("Invalid method or missing payment data:", { method, pidx, esewaResponse });
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("❌ Verification error");
      }
    };

    verifyPayment();
  }, [pidx, esewaResponse, userId, plan, amount, method]);

  return (
    <div className="text-center py-10">
      <h1 className="text-2xl font-semibold">{status}</h1>
      {(pidx || esewaResponse) && (
        <>
          <p className="text-gray-600 mt-2">Thank you for your purchase.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Go to Home
          </Link>
        </>
      )}
    </div>
  );
}