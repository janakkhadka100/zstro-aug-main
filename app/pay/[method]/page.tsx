"use client";

import { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

export default function PaymentPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; // Define base URL
  const router = useRouter();
  const params = useParams(); // Get dynamic route parameters
  const searchParams = useSearchParams();
  const method = params.method as string; // Extract method from route (/pay/[method])
  const amount = parseInt(searchParams.get("amount") || "1000"); // Get amount from query params
  const plan = searchParams.get("plan") || "weekly";

  useEffect(() => {
    const initiateKhalti = async () => {
      try {
        const res = await fetch("/api/khalti/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            return_url: `${BASE_URL}/payment-success`,
            website_url: BASE_URL,
            amount: amount * 100, // Khalti expects amount in paisa
            purchase_order_id: plan,
            purchase_order_name: `Premium ${plan} Plan`,
            customer_info: {
              name: "Ram Bahadur",
              email: "test@khalti.com",
              phone: "9800000001",
            },
          }),
        });

        const data = await res.json();
        if (data?.payment_url) {
          window.location.href = data.payment_url;
        } else {
          alert("Khalti initiation failed");
          router.push("/upgrade");
        }
      } catch (err) {
        console.error("Khalti error:", err);
        router.push("/upgrade");
      }
    };

    const initiateEsewa = async () => {
      try {
        const res = await fetch("/api/esewa/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            amount: amount,
            plan: plan,
            success_url: `${BASE_URL}/payment-success?method=esewa&plan=${plan}`,
          }),
        });

        const data = await res.json();
        console.log("eSewa initiation response:", data);

        if (data?.payment_url && data?.params) {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.payment_url;

          Object.entries(data.params).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        } else {
          alert("eSewa initiation failed");
          router.push("/upgrade");
        }
      } catch (err) {
        console.error("Esewa error:", err);
        router.push("/upgrade");
      }
    };

    if (method === "khalti") {
      initiateKhalti();
    } else if (method === "esewa") {
      initiateEsewa();
    } else {
      console.error(`Unsupported payment method: ${method}`);
      alert("Unsupported payment method");
      router.push("/upgrade");
    }
  }, [method, router, amount]);

  return (
    <div className="text-center py-10">
      <h1 className="text-2xl font-semibold">Redirecting to {method}...</h1>
      <p className="text-gray-600 mt-2">Please wait while we initiate your payment.</p>
    </div>
  );
}