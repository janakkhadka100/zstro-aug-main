"use client";

import { Suspense } from "react";
import PaymentSuccessContent from "../../components/payment-success-content";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
