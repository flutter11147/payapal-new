/** @format */
import React, { useState } from "react";
import axios from "axios";

const apiBase = "https://slotsubdomains.com/api/api/V1";

export default function GooglePayButton({ orderId, accessToken, amount = "10.00" }) {
  const [message, setMessage] = useState("");

  // Capture Order
  const captureOrder = async () => {
    try {
      const body = { orderId, accessToken };
      const response = await axios.post(
        `${apiBase}/paypal/captureOrder`,
        body,
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (err) {
      console.error("Capture Error:", err);
      throw new Error(err.response?.data?.message || "Capture failed");
    }
  };

  const startGooglePay = async () => {
    try {
      setMessage("Initializing Google Pay...");

      if (!window.paypal?.Googlepay || !window.google) {
        setMessage("❌ Google Pay SDK not loaded.");
        return;
      }

      // 1️⃣ Get Google Pay configuration from PayPal
      const googlePayConfig = await window.paypal.Googlepay().config();

      // 2️⃣ Init Google Pay Client
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: "TEST",
      });

      // 3️⃣ Build Google Pay payment request
      const paymentRequest = {
        ...googlePayConfig,
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: amount,
          currencyCode: "USD",
        },
      };

      // 4️⃣ Open Google Pay Popup
      const paymentData = await paymentsClient.loadPaymentData(paymentRequest);

      // 5️⃣ PayPal confirmOrder
      const confirm = await window.paypal.Googlepay().confirmOrder({
        orderId,
        paymentMethodData: paymentData.paymentMethodData,
      });

      // 6️⃣ Capture Order
      if (confirm.status === "APPROVED") {
        setMessage("Capturing Google Pay Payment...");
        await captureOrder();
        setMessage("✅ Google Pay Payment Successful!");
      } else {
        setMessage("❌ Google Pay Failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className="w-full flex flex-col items-center mb-4">
      <button
        onClick={startGooglePay}
        className="w-full bg-black text-white py-3 rounded text-sm mb-2"
      >
        Pay with Google Pay
      </button>

      {message && (
        <div
          className={`w-full mt-2 p-3 text-center rounded text-sm ${
            message.includes("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
