import React, { useCallback, useState } from "react";

/** Change this if your backend runs elsewhere */
const PAY_API_BASE = "https://bobbe.sentrifugo.com/api/payments/razorpay";

/** Load Razorpay SDK once */
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error("Razorpay SDK failed to load"));
    document.body.appendChild(s);
  });
}

/** Backend calls */
async function getRzpKey() {
  const r = await fetch('https://bobbe.sentrifugo.com/api/payments/razorpay/config');
  if (!r.ok) throw new Error("Failed to load Razorpay key");
  const { keyId } = await r.json();
  if (!keyId) throw new Error("Invalid key from server");
  return keyId;
}
async function createOrder({ amountPaise, receipt, notes }) {
  const r = await fetch('https://bobbe.sentrifugo.com/api/payments/razorpay/orders', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes,
    }),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(txt || "Failed to create order");
  }
  const { order } = await r.json();
  if (!order?.id) throw new Error("Invalid order from server");
  return order; // { id, amount, currency, ... }
}
async function verifyPayment(payload) {
  const r = await fetch('https://bobbe.sentrifugo.com/api/payments/razorpay/verify', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(txt || "Server verification failed");
  }
  return r.json(); // { success: true, message: "Payment verified" }
}

/**
 * Reusable Pay button for Razorpay
 * Props:
 * - amountPaise (number) -> amount in paise (₹500 => 50000)
 * - candidate (object)   -> { id, full_name, email, phone }
 * - className (string)   -> additional CSS classes for the button
 * - label (string)       -> button label
 * - onSuccess (fn)       -> callback after successful verification
 */
export default function Razorpay({
  amountPaise = 50000,
  candidate = {},
  className = "btn btn-sm btn-outline-primary hovbtn",
  label = "Pay",
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const handlePayClick = useCallback(async () => {
    try {
      setLoading(true);
      await loadRazorpay();

      const keyId = await getRzpKey();
      const order = await createOrder({
        amountPaise,
        receipt: `rcpt_${Date.now()}`,
        notes: {
          candidateId: candidate?.id || "demo",
          purpose: "InterviewFee",
        },
      });

      const rzp = new window.Razorpay({
        key: keyId,
        order_id: order.id, // REQUIRED for signature verification
        amount: String(order.amount),
        currency: order.currency,
        name: "Sentrifugo 2.0",
        description: "Application / Interview Fee",
        prefill: {
          name: candidate?.full_name || "Candidate",
          email: candidate?.email || "test@example.com",
          contact: candidate?.phone || "9999999999",
        },
        theme: { color: "#ff6a00" },
        handler: async (resp) => {
          try {
            const result = await verifyPayment(resp);
            if (result?.success) {
              alert("Payment successful ✅");
              onSuccess?.({
                orderId: order.id,
                amountPaise: order.amount,
                paymentId: resp.razorpay_payment_id,
              });
            } else {
              alert("Payment captured, but server verification failed.");
            }
          } catch (e) {
            console.error(e);
            alert("Payment captured, but verification failed on server.");
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the popup
          },
        },
      });

      rzp.on("payment.failed", (res) => {
        const msg = res?.error?.description || "Payment failed";
        alert(msg);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [amountPaise, candidate, onSuccess]);

  return (
    <button
      type="button"
      className={className}
      onClick={handlePayClick}
      disabled={loading}
      title={loading ? "Processing..." : label}
    >
      <b>{loading ? "Processing..." : label}</b>
    </button>
  );
}