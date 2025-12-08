import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { href } from "react-router-dom";

// ======================================================
// GLOBAL VARIABLES (must be outside component)
// ======================================================
let baseRequest = { apiVersion: 2, apiVersionMinor: 0 };
let paymentsClient = null;
let allowedPaymentMethods = null;
let merchantInfo = null;

export default function GooglePayWithPayPal() {
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googlePayReady, setGooglePayReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState("");

  // -------------------------------
  // GET ORDER ID + ACCESS TOKEN
  // -------------------------------
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");
  const accessToken = params.get("accessToken");

  const apiBase = "https://slotsubdomains.com/api/api/V1";

  // ❌ FIX: early return MUST be after hooks (React rule)
  // so we move it to bottom

  // -------------------------------
  // LOAD PAYPAL SDK
  // -------------------------------
  useEffect(() => {
    if (!document.getElementById("paypal-sdk")) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src =
        "https://www.paypal.com/sdk/js?client-id=AUEr46iZcPSPktWqUMOW3U3wAwUpYp9i8N0YBUguFIFEk2LNytTAKM73JcTO6stONNYEVl5d4DZ5zMVI&components=googlepay";
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      document.body.appendChild(script);
    } else {
      setPaypalLoaded(true);
    }
  }, []);

  // -------------------------------
  // LOAD GOOGLE PAY JS
  // -------------------------------
  useEffect(() => {
    if (!document.getElementById("googlepay-sdk")) {
      const script = document.createElement("script");
      script.id = "googlepay-sdk";
      script.src = "https://pay.google.com/gp/p/js/pay.js";
      script.async = true;
      script.onload = () => setGoogleLoaded(true);
      document.body.appendChild(script);
    } else {
      setGoogleLoaded(true);
    }
  }, []);

  // -------------------------------
  // FETCH AMOUNT FROM API
  // -------------------------------
  useEffect(() => {
    if (!orderId) return;

    async function getPaymentInfo() {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://slotsubdomains.com/api/api/v1/Paypal/getTransactioDataThrourghOrderId/${orderId}`
        );
        setPaymentData(res.data.data);
      } catch (err) {
        setError("Unable to fetch payment details.");
      } finally {
        setLoading(false);
      }
    }

    getPaymentInfo();
  }, [orderId]);

  console.log('paymentData',paymentData)
  // -------------------------------
  // WAIT FOR PayPal.Googlepay()
  // -------------------------------
  useEffect(() => {
    if (!paypalLoaded || !googleLoaded) return;

    const interval = setInterval(() => {
      if (window?.paypal?.Googlepay) {
        clearInterval(interval);
        setGooglePayReady(true);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [paypalLoaded, googleLoaded]);

  useEffect(() => {
    if (googlePayReady && paymentData) {
      onGooglePayLoaded();
    }
  }, [googlePayReady, paymentData]);

  // -------------------------------
  // GET PayPal GooglePay Config
  // -------------------------------
  async function getGooglePayConfig() {
    if (!allowedPaymentMethods || !merchantInfo) {
      const googlePayConfig = await window.paypal.Googlepay().config();

      // FIX merchantInfo fallback
      merchantInfo = {
        merchantId:
          googlePayConfig?.merchantInfo?.merchantId || "T8ER994YW7HA2",
        merchantName:
          googlePayConfig?.merchantInfo?.merchantName || "Ga Skill Games",
      };

      allowedPaymentMethods = googlePayConfig.allowedPaymentMethods;
    }

    return { allowedPaymentMethods, merchantInfo };
  }

  // -------------------------------
  // GOOGLE PAY CLIENT
  // -------------------------------
  function getPaymentsClient() {
    if (!paymentsClient && window.google) {
      paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: "TEST",
        paymentDataCallbacks: { onPaymentAuthorized },
      });
    }
    return paymentsClient;
  }

  // -------------------------------
  // RENDER GOOGLE PAY BUTTON
  // -------------------------------
  async function onGooglePayLoaded() {
    const pc = getPaymentsClient();
    const cfg = await getGooglePayConfig();

    pc.isReadyToPay({
      ...baseRequest,
      allowedPaymentMethods: cfg.allowedPaymentMethods,
    })
      .then((res) => {
        if (res.result) addGooglePayButton();
      })
      .catch(console.error);
  }

  function addGooglePayButton() {
    const pc = getPaymentsClient();
    const button = pc.createButton({
      onClick: onGooglePaymentButtonClicked,
    });

    const container = document.getElementById("button-container");
    if (container) {
      container.innerHTML = "";
      container.appendChild(button);
    }
  }

  // -------------------------------
  // TRANSACTION INFO (DYNAMIC AMOUNT)
  // -------------------------------
  function getGoogleTransactionInfo() {
  const amount = String(paymentData?.amount || "0");
    return {
      countryCode: "US",
      currencyCode: "USD",
      totalPriceStatus: "FINAL",
      totalPrice: amount,
      totalPriceLabel: "Total",
      displayItems: [
        { label: "Subtotal", type: "SUBTOTAL", price: amount },
        { label: "Tax", type: "TAX", price: "0" },
      ],
    };
  }

  // -------------------------------
  // GET PAYMENT REQUEST
  // -------------------------------
  async function getPaymentDataRequest() {
    const req = { ...baseRequest };
    const { allowedPaymentMethods, merchantInfo } = await getGooglePayConfig();

    req.allowedPaymentMethods = allowedPaymentMethods;
    req.transactionInfo = getGoogleTransactionInfo();
    req.merchantInfo = merchantInfo;
    req.callbackIntents = ["PAYMENT_AUTHORIZATION"];

    return req;
  }

  async function onGooglePaymentButtonClicked() {
    const req = await getPaymentDataRequest();
    const pc = getPaymentsClient();
    pc.loadPaymentData(req);
  }

  // -------------------------------
  // PAYMENT AUTH CALLBACK
  // -------------------------------
  function onPaymentAuthorized(paymentData) {
    return new Promise((resolve) => {
      processPayment(paymentData)
        .then(() => resolve({ transactionState: "SUCCESS" }))
        .catch(() => resolve({ transactionState: "ERROR" }));
    });
  }

  // -------------------------------
  // PROCESS PAYMENT
  // -------------------------------
  async function processPayment(paymentData) {
    try {
      console.log("Google Pay Payment Data:", paymentData);

      const confirmResult = await window.paypal.Googlepay().confirmOrder({
        orderId,
        paymentMethodData: paymentData.paymentMethodData,
      });

      if (confirmResult.status !== "APPROVED") {
        throw new Error("Order not approved by Google Pay");
      }

      // CAPTURE PAYMENT
      const response = await axios.post(
        `${apiBase}/paypal/captureOrder/${orderId}`,
        { orderId, accessToken },
        { headers: { "Content-Type": "application/json" } }
      );

      Swal.fire({
        icon: "success",
        title: "Payment Successful 🎉",
        text: "Your payment was captured successfully!",
      });
window.location.href = "https://arcade-game-frontend.netlify.app/success";
      return true;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Payment Failed ❌",
        text: err?.message || "Something went wrong.",
      });

      return false;
    }
  }

  // -------------------------------
  // EARLY RETURNS (must be BELOW hooks)
  // -------------------------------
  if (!orderId || !accessToken) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-screen px-6">
        <div className="text-5xl mb-3">⚠️</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Paypal Session Expired
        </h2>
        <p className="text-sm text-gray-500">
          The payment session is invalid or missing.
          <br />
          Please return to checkout and try again.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-10">Loading payment info…</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div className="w-full flex justify-center py-10">
      <div id="button-container" />
    </div>
  );
}
