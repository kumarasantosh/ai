"use client";

import { handlePayment } from "@/lib/action/razorpay.action";
import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface Props {
  userId: string;
  price: number;
  id: string;
  name: string;
  courseName: string;
  email: string;
}

const PaymentButton = ({ id, price, name, email, courseName }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, isLoaded } = useUser();

  const userId = user?.id;

  const onClick = async () => {
    setIsProcessing(true);
    await handlePayment(id, price, name, email, userId, courseName);
    setIsProcessing(false);
  };

  return (
    <button
      onClick={onClick}
      className="btn-primary w-full justify-center"
      disabled={isProcessing}
    >
      {isProcessing ? "Processing..." : `₹${price}`}
    </button>
  );
};

export default PaymentButton;
