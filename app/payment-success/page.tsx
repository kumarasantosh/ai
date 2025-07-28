import { auth } from "@clerk/nextjs/server";
import React from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

type Props = {
  searchParams: {
    userid: string;
    payment_id?: string;
    order_id?: string;
    companion_id?: string;
  };
};
const page = async ({ searchParams }: Props) => {
  const { userid, payment_id, order_id, companion_id } = await searchParams;
  const { userId } = await auth();
  if (userid != userId) {
    return <div>Unauthorized</div>;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-white flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
        <CheckCircle className="text-green-500 mx-auto w-16 h-16 mb-4 animate-bounce" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Payment Successful
        </h1>
        <p className="text-black-600 mb-6">Thank you for your purchase!</p>

        <div className="bg-black-50 rounded-lg p-4 text-left text-sm text-gray-700 space-y-2">
          <p>
            <span className="font-medium text-gray-900">User ID:</span>{" "}
            {userid || "N/A"}
          </p>
          <p>
            <span className="font-medium text-gray-900">Order ID:</span>{" "}
            {order_id || "N/A"}
          </p>
          <p>
            <span className="font-medium text-gray-900">Payment ID:</span>{" "}
            {payment_id || "N/A"}
          </p>
        </div>

        <Link
          href={`/companions/${companion_id}/details`}
          className="mt-6 inline-block bg-green-600 text-white text-sm font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-all"
        >
          Start Learning
        </Link>
      </div>
    </div>
  );
};

export default page;
