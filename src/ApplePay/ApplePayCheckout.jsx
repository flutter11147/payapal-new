
// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const apiBase = "https://slotsubdomains.com/api/api/V1";

// const ApplePayCheckout = ({
//   amount = "25.00",
//   label = "Your Business Name (Test Mode)",
//   currency = "USD",
//   country = "US",
//   onSuccess,
//   onError,
// }) => {
//   const [isSupported, setIsSupported] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // ---------------------------
//   // GET ORDER ID + TOKEN FROM URL
//   // ---------------------------
//   const params = new URLSearchParams(window.location.search);
//   const orderId = params.get("id");
//   const accessToken = params.get("accessToken");

//   if (!orderId || !accessToken) {
//     return (
//       <div className="flex flex-col items-center justify-center text-center px-6 py-12">
//         <div className="text-5xl mb-3">⚠️</div>
//         <h2 className="text-xl font-semibold text-gray-800 mb-2">
//           Apple Pay Session Expired
//         </h2>
//         <p className="text-sm text-gray-500">
//           Your payment session is no longer valid. <br /> Please try again.
//         </p>
//       </div>
//     );
//   }

//   // ---------------------------
//   // CAPTURE ORDER
//   // ---------------------------
//   const captureOrder = async () => {
//     try {
//       const response = await axios.post(
//         `${apiBase}/paypal/captureOrder/${orderId}`
//       );
//       return response.data;
//     } catch (err) {
//       setError("Failed to capture PayPal order");
//       throw err;
//     }
//   };

//   // ---------------------------
//   // CHECK APPLE PAY SUPPORT
//   // ---------------------------
//   useEffect(() => {
//     if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
//       setIsSupported(true);
//     } else {
//       setIsSupported(false);
//     }
//   }, []);

//   // ---------------------------
//   // START APPLE PAY
//   // ---------------------------
//   const startApplePay = async () => {
//     if (!window.ApplePaySession) {
//       setError("Apple Pay is not supported on this browser.");
//       return;
//     }

//     setError("");
//     setLoading(true);

//     try {
//       const paymentRequest = {
//         countryCode: country,
//         currencyCode: currency,
//         supportedNetworks: ["visa", "masterCard", "amex", "discover"],
//         merchantCapabilities: ["supports3DS"],

//         merchantIdentifier: "T8ER994YW7HA2",
//         merchantName: label || "Ga Skill Games",

//         total: {
//           label: label + " (Test Mode)",
//           amount: amount,
//           type: "final",
//         },

//         lineItems: [
//           {
//             label: "Test Payment",
//             amount: amount,
//             type: "final",
//           },
//         ],
//       };

//       const session = new ApplePaySession(3, paymentRequest);

//       // ---------------------------
//       // REAL MERCHANT VALIDATION
//       // ---------------------------
//       session.onvalidatemerchant = async (event) => {
//         try {
//           const { data } = await axios.post(
//             `${apiBase}/applepay/validate-merchant`,
//             { validationURL: event.validationURL }
//           );

//           console.log("Merchant session:", data);

//           session.completeMerchantValidation(data);
//         } catch (err) {
//           console.error("Merchant validation failed:", err);
//           session.abort();
//           setError("Merchant validation failed.");
//         }
//       };

//       // ---------------------------
//       // PAYMENT AUTHORIZED
//       // ---------------------------
//       session.onpaymentauthorized = async () => {
//         try {
//           const result = await captureOrder();

//           session.completePayment(ApplePaySession.STATUS_SUCCESS);
//           onSuccess?.(result);
//         } catch (err) {
//           session.completePayment(ApplePaySession.STATUS_FAILURE);
//           onError?.(err);
//         } finally {
//           setLoading(false);
//         }
//       };

//       session.oncancel = () => {
//         setLoading(false);
//         setError("Payment cancelled by user.");
//       };

//       session.begin();
//     } catch (error) {
//       setError(error.message || "Apple Pay error.");
//       setLoading(false);
//     }
//   };

//   // ---------------------------
//   // UI
//   // ---------------------------
//   if (!isSupported) {
//     return (
//       <div style={{ textAlign: "center", padding: "10px", color: "#777" }}>
//         Apple Pay is not available.
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center justify-center w-full mt-6">
//       <button
//         onClick={startApplePay}
//         disabled={loading}
//         style={{
//           WebkitAppearance: "-apple-pay-button",
//           WebkitApplePayButtonType: "buy",
//           WebkitApplePayButtonStyle: "black",
//           width: "200px",
//           height: "44px",
//           borderRadius: "8px",
//           cursor: loading ? "not-allowed" : "pointer",
//           opacity: loading ? 0.5 : 1,
//         }}
//       ></button>

//       {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
//     </div>
//   );
// };

// export default ApplePayCheckout;



// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const apiBase = "https://slotsubdomains.com/api/api/V1";

// const ApplePayCheckout = ({
//   amount = "25.00",
//   label = "Your Business Name (Test Mode)",
//   currency = "USD",
//   country = "US",
//   onSuccess,
//   onError,
// }) => {
//   const [isSupported, setIsSupported] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   console.log("🔍 ApplePayCheckout component loaded");
//   console.log("Query Params:", window.location.search);

//   // ---------------------------
//   // GET ORDER ID + TOKEN FROM URL
//   // ---------------------------
//   const params = new URLSearchParams(window.location.search);
//   const orderId = params.get("id");
//   const accessToken = params.get("accessToken");

//   console.log("👉 orderId:", orderId);
//   console.log("👉 accessToken:", accessToken);

//   if (!orderId || !accessToken) {
//     console.warn("⚠️ Apple Pay session expired due to missing params.");
//     return (
//       <div className="flex flex-col items-center justify-center text-center px-6 py-12">
//         <div className="text-5xl mb-3">⚠️</div>
//         <h2 className="text-xl font-semibold text-gray-800 mb-2">
//           Apple Pay Session Expired
//         </h2>
//         <p className="text-sm text-gray-500">
//           Your payment session is no longer valid. <br /> Please try again.
//         </p>
//       </div>
//     );
//   }

//   // ---------------------------
//   // CAPTURE ORDER
//   // ---------------------------
//   const captureOrder = async () => {
//     console.log("📦 Capturing PayPal order:", orderId);
//     try {
//       const response = await axios.post(
//         `${apiBase}/paypal/captureOrder/${orderId}`
//       );

//       console.log("✅ PayPal captureOrder response:", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ PayPal capture order failed:", err);
//       setError("Failed to capture PayPal order");
//       throw err;
//     }
//   };

//   // ---------------------------
//   // CHECK APPLE PAY SUPPORT
//   // ---------------------------
//   useEffect(() => {
//     console.log("🔎 Checking ApplePaySession support...");

//     if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
//       console.log("✅ Apple Pay is supported");
//       setIsSupported(true);
//     } else {
//       console.warn("❌ Apple Pay is NOT supported");
//       setIsSupported(false);
//     }
//   }, []);

//   // ---------------------------
//   // START APPLE PAY
//   // ---------------------------
//   const startApplePay = async () => {
//     console.log("▶️ Apple Pay button clicked");

//     if (!window.ApplePaySession) {
//       console.error("❌ Apple Pay not supported by browser");
//       setError("Apple Pay is not supported on this browser.");
//       return;
//     }

//     console.log("🛒 Starting Apple Pay session...");
//     setError("");
//     setLoading(true);

//     try {
//       const paymentRequest = {
//         countryCode: country,
//         currencyCode: currency,
//         supportedNetworks: ["visa", "masterCard", "amex"],
//         merchantCapabilities: ["supports3DS"],
//         merchantIdentifier: "merchant.com.applepaydemo",
//         merchantName: label || "Ga Skill Games",

//         total: {
//           label: label + " (Test Mode)",
//           amount: amount,
//           type: "final",
//         },

//         lineItems: [
//           {
//             label: "Test Payment",
//             amount: amount,
//             type: "final",
//           },
//         ],
//       };

//       console.log("📤 Apple Pay Payment Request:", paymentRequest);

//       const session = new ApplePaySession(3, paymentRequest);

//       // ---------------------------
//       // TEST MODE: SKIP VALIDATION
//       // ---------------------------
//       session.onvalidatemerchant = (event) => {
//         console.warn("⚠️ TEST MODE: Skipping merchant validation");
//         console.log("Merchant validation event:", event);

//         session.completeMerchantValidation({});
//       };

//       // ---------------------------
//       // PAYMENT AUTHORIZED
//       // ---------------------------
//       session.onpaymentauthorized = async (paymentEvent) => {
//         console.log("💳 Apple Pay payment authorized:", paymentEvent);

//         try {
//           const result = await captureOrder();

//           console.log("🎉 Payment Success:", result);

//           session.completePayment(ApplePaySession.STATUS_SUCCESS);
//           onSuccess?.(result);
//         } catch (err) {
//           console.error("❌ Payment capture failed:", err);
//           session.completePayment(ApplePaySession.STATUS_FAILURE);
//           onError?.(err);
//         } finally {
//           setLoading(false);
//         }
//       };

//       session.oncancel = () => {
//         console.warn("⚠️ Apple Pay was cancelled by user");
//         setLoading(false);
//         setError("Payment cancelled by user.");
//       };

//       console.log("🚀 Starting Apple Pay Session...");
//       session.begin();
//     } catch (error) {
//       console.error("❌ Apple Pay error:", error);
//       setError(error.message || "Apple Pay error.");
//       setLoading(false);
//     }
//   };

//   // ---------------------------
//   // UI
//   // ---------------------------
//   if (!isSupported) {
//     console.log("🚫 Apple Pay not supported UI rendered");
//     return (
//       <div style={{ textAlign: "center", padding: "10px", color: "#777" }}>
//         Apple Pay is not available.
//       </div>
//     );
//   }

//   console.log("✅ Apple Pay button rendered");

//   return (
//     <div className="flex flex-col items-center justify-center w-full mt-6">
//       <button
//         onClick={startApplePay}
//         disabled={loading}
//         style={{
//           WebkitAppearance: "-apple-pay-button",
//           WebkitApplePayButtonType: "buy",
//           WebkitApplePayButtonStyle: "black",
//           width: "200px",
//           height: "44px",
//           borderRadius: "8px",
//           cursor: loading ? "not-allowed" : "pointer",
//           opacity: loading ? 0.5 : 1,
//         }}
//       ></button>

//       {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
//     </div>
//   );
// };

// export default ApplePayCheckout;



import React, { useEffect, useState } from "react";
import axios from "axios";

const apiBase = "https://flyweistechnologies.in/api/api/V1";

const ApplePayCheckout = ({
  amount = "25.00",
  label = "Your Business Name (Test Mode)",
  currency = "USD",
  country = "US",
  onSuccess,
  onError,
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  console.log("🔍 ApplePayCheckout component loaded");
  console.log("Query Params:", window.location.search);

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");
  const accessToken = params.get("accessToken");

  if (!orderId || !accessToken) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="text-5xl mb-3">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Apple Pay Session Expired
        </h2>
        <p className="text-sm text-gray-500">
          Your payment session is no longer valid. <br /> Please try again.
        </p>
      </div>
    );
  }

  const captureOrder = async () => {
    console.log("📦 Capturing PayPal order:", orderId);

    const res = await axios.post(
      `${apiBase}/paypal/captureOrder/${orderId}`
    );

    return res.data;
  };

  useEffect(() => {
    if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  // ---------------------------
  // START APPLE PAY
  // ---------------------------
  const startApplePay = async () => {
    console.log("▶️ Apple Pay button clicked");

    if (!window.ApplePaySession) {
      setError("Apple Pay is not supported on this device.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const paymentRequest = {
        countryCode: country,
        currencyCode: currency,
        supportedNetworks: ["visa", "masterCard", "amex"],
        merchantCapabilities: ["supports3DS"],
        merchantIdentifier: "merchant.com.applepaydemo", // CHANGE TO YOUR REAL MERCHANT ID
        total: {
          label: label,
          amount: amount,
          type: "final",
        },
      };

      const session = new ApplePaySession(3, paymentRequest);

      // --------------------------------------------
      // REAL MERCHANT VALIDATION IMPLEMENTATION
      // --------------------------------------------
      session.onvalidatemerchant = async (event) => {
        console.log("🔗 Validating Merchant with Backend...");
        console.log("validationURL:", event.validationURL);

        try {
          const response = await axios.post(
            `${apiBase}/paypal/validateMerchantUrl`,
            {
              validationURL: event.validationURL,
              merchantIdentifier: "merchant.com.prizeskillz.pay", // CHANGE THIS
              domainName: window.location.hostname,
              displayName: label,
            }
          );

          console.log("✅ Merchant Validation Response:", response.data);

          session.completeMerchantValidation(response.data);
        } catch (err) {
          console.error("❌ Merchant validation failed:", err);
          session.abort();
          setError("Merchant validation failed.");
          setLoading(false);
        }
      };

      // --------------------------------------------
      // PAYMENT AUTHORIZED
      // --------------------------------------------
      session.onpaymentauthorized = async (paymentEvent) => {
        console.log("💳 Payment Authorized:", paymentEvent);

        try {
          const result = await captureOrder();
          session.completePayment(ApplePaySession.STATUS_SUCCESS);
          onSuccess?.(result);
        } catch (err) {
          console.error("❌ Payment Failed:", err);
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          onError?.(err);
        } finally {
          setLoading(false);
        }
      };

      session.oncancel = () => {
        console.warn("⚠️ Apple Pay Cancelled by User");
        setError("Payment cancelled.");
        setLoading(false);
      };

      session.begin();
    } catch (err) {
      console.error("❌ Apple Pay Error:", err);
      setError("Apple Pay failed to start.");
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div style={{ textAlign: "center", padding: "10px", color: "#777" }}>
        Apple Pay is not available.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full mt-6">
      <button
        onClick={startApplePay}
        disabled={loading}
        style={{
          WebkitAppearance: "-apple-pay-button",
          WebkitApplePayButtonType: "buy",
          WebkitApplePayButtonStyle: "black",
          width: "200px",
          height: "44px",
          borderRadius: "8px",
        }}
      ></button>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default ApplePayCheckout;
