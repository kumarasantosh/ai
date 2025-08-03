import { getRecentPurchase } from "@/lib/action/companion.action";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Subscription = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");
  const recentPurchase = await getRecentPurchase();

  return (
    <main className="flex bg-dark-space text-gray-300 flex-col min-h-screen p-6 ">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>

      {recentPurchase?.length > 0 ? (
        <Table className="text-white">
          <TableCaption>A list of your recent purchases.</TableCaption>
          <TableHeader>
            <TableRow className="text-gray-300">
              <TableHead className="w-[100px] text-gray-300">
                Order ID
              </TableHead>
              <TableHead className="text-gray-300">Companion</TableHead>
              <TableHead className="text-gray-300">Price</TableHead>
              <TableHead className="text-gray-300">Purchased At</TableHead>
              <TableHead className="text-right text-gray-300">
                Access Expires
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {recentPurchase.map((purchase) => (
              <TableRow key={purchase.id ?? purchase.purchaseId}>
                <TableCell className="font-medium text-white">
                  {purchase.id ?? purchase.purchaseId}
                </TableCell>
                <TableCell>{purchase.companion?.name || "N/A"}</TableCell>
                <TableCell className="">{purchase.price_at_purchase}</TableCell>
                <TableCell>
                  {purchase.purchased_at
                    ? new Date(purchase.purchased_at).toLocaleDateString()
                    : "—"}
                </TableCell>

                <TableCell className="text-right">
                  {purchase.access_expires_at
                    ? new Date(purchase.access_expires_at).toLocaleDateString()
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-gray-500">No purchases found.</p>
      )}
    </main>
  );
};

export default Subscription;
