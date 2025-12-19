import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import apiService from "../../../services/apiService";
import axios from "axios";
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
  //const r = await fetch("https://bobjava.sentrifugo.com:8443/dev-candidate-app/api/v1/razorpay/config");
  // const r = await apiService.getConfig();
   const r = await axios.get('http://192.168.20.115:8082/api/v1/razorpay/config',
        {
          headers: {
            "X-Client": "candidate",
            "Content-Type": "application/json"
          }
        }
      );
   console.log ("test", r);
  // if (!r.ok) throw new Error("Failed to load Razorpay key");
  const keyId  =r.keyId;
  console.log( "keys",  keyId)
  if (!keyId) throw new Error("Invalid key from server");
  return keyId;
}
async function createOrder({ amountPaise, receipt, notes, candidate_id, position_id }) {
  try {
    const data = { 
      amount: amountPaise,
      currency: "INR",
      receipt, 
      notes, 
      candidate_id, 
      position_id 
    };

    //const r = await apiService.getRazorOrder(data);
   const r = await axios.post ('http://192.168.20.115:8082/api/v1/razorpay/orders',data,  
        {
          headers: {
            "X-Client": "candidate",
            "Content-Type": "application/json"
          }
        },
        
      );

    const order = r;
    console.log("ORDER:", order);

    // Correct validation
    if (!order?.id) {
      throw new Error("Invalid order from server");
    }

    return order;

  } catch (err) {

    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      "Failed to create order";

    throw new Error(msg);
  }
}


async function verifyPayment(payload) {
  try {
    //const r = await apiService.getRazorVerify(payload);
const r = await axios.post('http://192.168.20.115:8082/api/v1/razorpay/verify',payload,
        {
          headers: {
            "X-Client": "candidate",
            "Content-Type": "application/json"
          }
        }
      );

    // Axios returns data directly
    return r.data; // { success: true, message: "Payment verified" }

  } catch (err) {
    const msg =
      err.response?.data?.message ||
      err.response?.data ||
      "Server verification failed";

    throw new Error(msg);
  }
}

export default function Razorpay({
  amountPaise = 50000,
  candidate = {},
  className = "btn btn-sm btn-outline-primary hovbtn",
  label = "Pay",
  onSuccess,
  // 🔹 NEW: Called when user closes popup
  position_id,
  onClose,
  autoTrigger = false, // 🔹 NEW: Auto-open Razorpay when mounted
}) {
  const userLoginData = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(false);

  const initiatePayment = useCallback(async () => {
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
        candidate_id: userLoginData?.candidate_id,
        position_id,
      });

      const rzp = new window.Razorpay({
        key: keyId,
        order_id: order.id,
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
            // onClose?.(); // Call when user closes popup
            if (typeof onClose === "function") {
              onClose(); // Call a callback passed from parent
            }
          },
        },
      });

      rzp.on("payment.failed", (res) => {
        alert(res?.error?.description || "Payment failed");
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [amountPaise, candidate, onSuccess, onClose, position_id]);

  // 🔹 Auto-trigger Razorpay when mounted
  useEffect(() => {
    if (autoTrigger) {
      initiatePayment();
    }
  }, [autoTrigger, initiatePayment]);

  // If auto-triggering, no need to render a button
  if (autoTrigger) return null;

  return (
    <button
      type="button"
      className={className}
      onClick={initiatePayment}
      disabled={loading}
      title={loading ? "Processing..." : label}
    >
      <b>{loading ? "Processing..." : label}</b>
    </button>
  );
}
