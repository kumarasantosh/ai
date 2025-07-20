"use client";
import React, { useState } from "react";
import Script from "next/script";
import { redirect } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage = () => {
  const amount = 100;
  const [isProcessing, setisProcessing] = useState(false);
  const handlePayment = async () => {
    setisProcessing(true);
    try {
      const response = await fetch("/api/create-order", { method: "POST" });
      const data = await response.json();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        name: "Just",
        description: "Test Transaction",
        order_id: data.orderId,
        handler: function (response: any) {
          console.log("Payment Success", response);
        },
        prefill: {
          name: "John Doe",
          email: "test@gmail.com",
          contact: "12345678",
        },
        theme: {
          color: "#3399cc",
        },
      };
      const rzpi = new window.Razorpay(options);
      rzpi.open();
    } catch (e) {
      console.log(e);
    } finally {
      setisProcessing(false);
      redirect("/");
    }
  };
  return (
    <main>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Payment Page</h1>
          <p className="mb-4">Amount to pay: {amount} INR</p>
          <button onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? "processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default PaymentPage;
