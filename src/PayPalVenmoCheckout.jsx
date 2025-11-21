/** @format */
import React, { useEffect, useState } from "react";
import loadScript from "load-script";
import axios from "axios";

const apiBase = "https://slotsubdomains.com/api/api/V1";

export default function PayPalVenmoCheckout() {
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [message, setMessage] = useState("");

  const loadPayPalSdk = () => {
    loadScript(
      `https://www.paypal.com/sdk/js?client-id=Ab5nPVVXVnbaCWqBAwZ4ZJb0LdiTTVSnN3K0Z1mPfSzWJaTK-IyARFoHCX5zf0RBjvlfElWkGzcCnG6A&currency=USD&intent=capture&enable-funding=paypal,venmo`,
      (err) => {
        if (!err) setIsSdkReady(true);
      }
    );
  };

  useEffect(() => {
    loadPayPalSdk();
  }, []);

  const getAccessToken = async () => {
    const res = await axios.post(`${apiBase}/Paypal/getAccessTokens`);
    return res.data.accessToken;
  };

  const createOrder = async () => {
    const accessToken = await getAccessToken();
    const res = await axios.post(
      `${apiBase}/paypal/createOrder`,
      { amount: "10.00", accessToken },
      { headers: { "Content-Type": "application/json" } }
    );

    return (
      res.data?.id?.id ||
      res.data?.id ||
      res.data?.orderId ||
      res.data?.orderID
    );
  };

  const captureOrder = async (orderID) => {
    const res = await axios.post(
      `${apiBase}/paypal/captureOrder/${orderID}`,
      {},
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  };

  useEffect(() => {
    if (!isSdkReady) return;

    window.paypal.Buttons({
      fundingSource: "paypal", // PayPal
      createOrder: async () => await createOrder(),
      onApprove: async (data) => {
        await captureOrder(data.orderID);
        setMessage("✅ PayPal Payment Successful!");
      },
    }).render("#paypal-btn");

    // window.paypal.Buttons({
    //   fundingSource: "venmo", // Venmo
    //   createOrder: async () => await createOrder(),
    //   onApprove: async (data) => {
    //     await captureOrder(data.orderID);
    //     setMessage("🎉 Venmo Payment Successful!");
    //   },
    // }).render("#venmo-btn");
  }, [isSdkReady]);

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>PayPal + Venmo Checkout</h2>

      <div id="paypal-btn" style={{ marginBottom: 20 }}></div>
      <div id="venmo-btn"></div>

      {message && (
        <div style={{ marginTop: 20, padding: 10, background: "#eef" }}>
          {message}
        </div>
      )}
    </div>
  );
}
