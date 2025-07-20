"use client";

import { useUser } from "@clerk/nextjs";
import PaymentButton from "./PaymentButton";

interface Props {
  id: string;
  price: number;
  courseName: string;
}

const ClientPaymentWrapper = ({ id, price, courseName }: Props) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) return null;

  return (
    <PaymentButton
      id={id}
      price={price}
      name={user.firstName ?? "User"}
      courseName={courseName}
      email={user.emailAddresses[0]?.emailAddress ?? ""}
    />
  );
};

export default ClientPaymentWrapper;
