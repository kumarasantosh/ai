export const handlePayment = async (
  id: string, // companion ID
  amount: number,
  name: string,
  email: string,
  userid: string,
  courseName: string
) => {
  try {
    // 1. Create Razorpay order
    const response = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: amount }),
    });

    const data = await response.json();
    if (!data.orderId) throw new Error("Order ID not received");

    // 2. Razorpay options
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: "INR",
      name: "Just",
      description: `${courseName}`,
      order_id: data.orderId,

      handler: async function (response: any) {
        console.log("✅ Payment Success:", response);
        const { razorpay_payment_id: paymentId, razorpay_order_id: orderId } =
          response;

        await fetch("/api/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companionId: id,
            price: amount,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
          }),
        });
        const params = new URLSearchParams({
          payment_id: paymentId,
          order_id: orderId,
          companion_id: id,
          userid: userid,
        });

        // 4. Redirect to course page
        window.location.href = `/payment-success?${params.toString()}`;
      },

      prefill: {
        name,
        email,
        contact: "1234567890",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (e) {
    console.error("❌ Payment error:", e);
    alert("Payment failed. Please try again.");
  }
};
