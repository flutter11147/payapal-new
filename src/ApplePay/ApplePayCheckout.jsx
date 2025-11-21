// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const apiBase = "https://slotsubdomains.com/api/api/V1";

// const ApplePayCheckout = ({
//   amount = "25.00",
//   label = "Your Business Name",
//   currency = "USD",
//   country = "US",
//   onSuccess,
//   onError,
// }) => {
//   const [isSupported, setIsSupported] = useState(false);
//   const [isPayPalReady, setIsPayPalReady] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [accessToken, setAccessToken] = useState("");
//   const [currentOrderId, setCurrentOrderId] = useState("");

//   // ✅ GET ACCESS TOKEN (same as PayPal component)
//   const getAccessToken = async () => {
//     try {
//       const res = await axios.post(`${apiBase}/Paypal/getAccessTokens`);
//       const token = res?.data?.accessToken;
//       setAccessToken(token);
//       return token;
//     } catch (err) {
//       console.error("Access token error:", err);
//       setError("Failed to get access token.");
//       throw err;
//     }
//   };

//   // ✅ CREATE ORDER (same as PayPal component)
//   const createOrder = async (token) => {
//     try {
//       const body = { amount, accessToken: token };
//       const response = await axios.post(`${apiBase}/paypal/createOrder`, body, {
//         headers: { "Content-Type": "application/json" },
//       });

//       console.log("Create Order Response:", response.data);

//       // Check different possible response structures
//       let orderId;
      
//       if (response?.data?.id?.id) {
//         orderId = response.data.id.id;
//       } else if (response?.data?.id) {
//         orderId = response.data.id;
//       } else if (response?.data?.orderId) {
//         orderId = response.data.orderId;
//       } else if (response?.data?.orderID) {
//         orderId = response.data.orderID;
//       }

//       console.log("Extracted Order ID:", orderId);

//       if (!orderId) {
//         console.error("Full response:", JSON.stringify(response.data, null, 2));
//         throw new Error("Invalid order ID - check console");
//       }

//       // Store the order ID
//       setCurrentOrderId(orderId);
      
//       return orderId;
//     } catch (err) {
//       console.error("Create order error:", err);
//       setError("Failed to create order: " + (err.response?.data?.message || err.message));
//       throw err;
//     }
//   };

//   // ✅ CAPTURE ORDER (same as PayPal component)
//   const captureOrder = async (token) => {
//     try {
//       console.log("Capturing order:", currentOrderId);
      
//       if (!currentOrderId) {
//         throw new Error("No order ID available");
//       }
      
//       const body = { orderID: currentOrderId, accessToken: token };

//       const response = await axios.post(
//         `${apiBase}/paypal/captureOrder`,
//         body,
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       console.log("Capture response:", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("Capture error:", err);
//       setError("Failed to capture: " + (err.response?.data?.message || err.message));
//       throw err;
//     }
//   };

//   // ✅ Check for PayPal SDK and Apple Pay availability
//   useEffect(() => {
//     const checkAvailability = () => {
//       // Check if PayPal SDK is loaded
//       if (window.paypal && window.paypal.Applepay) {
//         setIsPayPalReady(true);
        
//         // Check merchant eligibility using PayPal's config method
//         try {
//           const config = window.paypal.Applepay().config();
          
//           // Check if device can make Apple Pay payments
//           if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
//             setIsSupported(true);
//           } else {
//             setIsSupported(false);
//           }
//         } catch (err) {
//           console.error("PayPal Apple Pay config error:", err);
//           setIsSupported(false);
//         }
//       } else {
//         setIsPayPalReady(false);
//         // Fallback: Check native Apple Pay
//         if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
//           setIsSupported(true);
//         } else {
//           setIsSupported(false);
//         }
//       }
//     };

//     // Check immediately
//     checkAvailability();

//     // Also check after a delay to ensure SDKs are loaded
//     const timer = setTimeout(checkAvailability, 500);

//     return () => clearTimeout(timer);
//   }, []);

//   // 💳 Start Apple Pay session using PayPal's methods
//   const startApplePay = async () => {
//     if (!window.ApplePaySession) {
//       setError("Apple Pay is not supported on this device/browser.");
//       return;
//     }

//     setError("");
//     setLoading(true);

//     try {
//       // Create payment request
//       const paymentRequest = {
//         countryCode: country,
//         currencyCode: currency,
//         supportedNetworks: ["visa", "masterCard", "amex", "discover"],
//         merchantCapabilities: ["supports3DS"],
//         total: {
//           label,
//           amount,
//         },
//       };

//       // Create Apple Pay session
//       const session = new ApplePaySession(3, paymentRequest);

//       // 🔐 Merchant Validation using PayPal's validateMerchant method
//       session.onvalidatemerchant = async (event) => {
//         try {
//           if (window.paypal && window.paypal.Applepay && isPayPalReady) {
//             // Use PayPal's validateMerchant method
//             const merchantSession = await window.paypal.Applepay().validateMerchant({
//               validationURL: event.validationURL,
//             });
//             session.completeMerchantValidation(merchantSession);
//           } else {
//             // Fallback to your backend API
//             const token = accessToken || (await getAccessToken());
//             const response = await axios.post(
//               `${apiBase}/applepay/validateMerchant`,
//               {
//                 validationURL: event.validationURL,
//                 accessToken: token
//               },
//               {
//                 headers: { "Content-Type": "application/json" },
//               }
//             );

//             const merchantSession = response.data;
//             session.completeMerchantValidation(merchantSession);
//           }
//         } catch (err) {
//           console.error("Merchant validation error:", err);
//           session.abort();
//           setError("Merchant validation failed.");
//           setLoading(false);
//           onError?.(err);
//         }
//       };

//       // 💰 Payment Authorization - USING YOUR API STRUCTURE
//       session.onpaymentauthorized = async (event) => {
//         try {
//           // Get access token
//           const token = accessToken || (await getAccessToken());

//           // Create order using YOUR API
//           const orderId = await createOrder(token);

//           if (window.paypal && window.paypal.Applepay && isPayPalReady) {
//             // Use PayPal's confirmOrder to process the payment
//             const confirmResult = await window.paypal.Applepay().confirmOrder({
//               orderID: orderId,
//               token: event.payment.token,
//               billingContact: event.payment.billingContact,
//               shippingContact: event.payment.shippingContact,
//             });

//             console.log("Apple Pay confirm result:", confirmResult);

//             // Now capture the order using YOUR API
//             const captureResult = await captureOrder(token);

//             if (captureResult) {
//               session.completePayment(ApplePaySession.STATUS_SUCCESS);
//               setError("");
//               onSuccess?.(captureResult);
//             } else {
//               session.completePayment(ApplePaySession.STATUS_FAILURE);
//               setError("Payment failed. Try again.");
//               onError?.(captureResult);
//             }
//           } else {
//             // Fallback: Process payment through your backend
//             const paymentData = event.payment.token.paymentData;

//             const response = await axios.post(
//               `${apiBase}/applepay/processPayment`,
//               {
//                 paymentData,
//                 amount,
//                 orderID: orderId,
//                 accessToken: token
//               },
//               {
//                 headers: { "Content-Type": "application/json" },
//               }
//             );

//             const result = response.data;

//             if (result.success) {
//               session.completePayment(ApplePaySession.STATUS_SUCCESS);
//               setError("");
//               onSuccess?.(result);
//             } else {
//               session.completePayment(ApplePaySession.STATUS_FAILURE);
//               setError("Payment failed. Try again.");
//               onError?.(result);
//             }
//           }
//         } catch (err) {
//           console.error("Payment processing error:", err);
//           session.completePayment(ApplePaySession.STATUS_FAILURE);
//           setError("Payment processing error: " + err.message);
//           onError?.(err);
//         } finally {
//           setLoading(false);
//         }
//       };

//       // ❌ Handle cancel
//       session.oncancel = () => {
//         setLoading(false);
//         setError("Payment cancelled by user.");
//       };

//       // 🚀 Begin Apple Pay Flow
//       session.begin();
//     } catch (err) {
//       console.error("Apple Pay error:", err);
//       setError(err.message || "Failed to start Apple Pay session.");
//       setLoading(false);
//       onError?.(err);
//     }
//   };

//   // 🚫 Not supported
//   if (!isSupported) {
//     return (
//       <div style={{ textAlign: "center", color: "#6b7280", fontSize: "14px", padding: "10px" }}>
//         Apple Pay is not available on this device or browser.
//       </div>
//     );
//   }

//   // ✅ UI (Apple style button)
//   return (
//     <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
//       <button
//         onClick={startApplePay}
//         disabled={loading}
//         style={{
//           WebkitAppearance: "-apple-pay-button",
//           WebkitApplePayButtonType: "buy",
//           WebkitApplePayButtonStyle: "black",
//           width: "192px",
//           height: "48px",
//           borderRadius: "8px",
//           border: "none",
//           cursor: loading ? "not-allowed" : "pointer",
//           opacity: loading ? 0.5 : 1,
//           transition: "opacity 0.2s ease-in-out",
//         }}
//         aria-label="Pay with Apple Pay"
//       >
//         {loading && (
//           <span style={{ fontSize: "14px", color: "#1f2937", fontWeight: 500 }}>
//             Processing...
//           </span>
//         )}
//       </button>

//       {error && (
//         <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", textAlign: "center" }}>
//           {error}
//         </p>
//       )}
//     </div>
//   );
// };

// export default ApplePayCheckout;

import React, { useEffect, useState } from "react";
import axios from "axios";

const apiBase = "https://slotsubdomains.com/api/api/V1";

const ApplePayCheckout = ({
  amount = "25.00",
  label = "Your Business Name",
  currency = "USD",
  country = "US",
  onSuccess,
  onError,
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------
  // GET ORDER ID + TOKEN FROM URL
  // ---------------------------
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");
  const accessToken = params.get("accessToken");

  console.log("Order ID:", orderId);
  console.log("Access Token:", accessToken);
if (!orderId || !accessToken) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12">
      
      <div className="text-5xl mb-3">⚠️</div>

      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Apple Pay Session Expired
      </h2>

      <p className="text-sm text-gray-500">
        Your payment session is no longer valid.
        <br />
        Please return to checkout and try again.
      </p>

      {/* <button
        onClick={() => (window.location.href = "/")}
        className="mt-5 px-5 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition"
      >
        Go Back
      </button> */}
    </div>
  );
}



  // ---------------------------
  // CAPTURE ORDER
  // ---------------------------
  const captureOrder = async () => {
    try {
      const body = { orderID: orderId, accessToken };

      console.log("Capturing Order:", body);

      const response = await axios.post(`${apiBase}/paypal/captureOrder`, body);
      return response.data;
    } catch (err) {
      console.error("Capture Order Error:", err);
      setError("Failed to capture the PayPal order");
      throw err;
    }
  };

  // ---------------------------
  // CHECK APPLE PAY SUPPORT
  // ---------------------------
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
    if (!window.ApplePaySession) {
      setError("Apple Pay is not supported on this browser.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // PAYMENT REQUEST
      const paymentRequest = {
        countryCode: country,
        currencyCode: currency,
        supportedNetworks: ["visa", "masterCard", "amex", "discover"],
        merchantCapabilities: ["supports3DS"],
        total: { label, amount },
      };

      const session = new ApplePaySession(3, paymentRequest);

      // ---------------------------
      // NO MERCHANT VALIDATION
      // ---------------------------
      session.onvalidatemerchant = (event) => {
        console.warn("⚠ No merchant validation used.");
        session.completeMerchantValidation({});
      };

      // ---------------------------
      // PAYMENT AUTHORIZED
      // ---------------------------
      session.onpaymentauthorized = async () => {
        try {
          const captureResult = await captureOrder();

          if (captureResult) {
            session.completePayment(ApplePaySession.STATUS_SUCCESS);
            onSuccess?.(captureResult);
          } else {
            session.completePayment(ApplePaySession.STATUS_FAILURE);
            onError?.("Capture failed");
          }
        } catch (err) {
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          onError?.(err);
        } finally {
          setLoading(false);
        }
      };

      // CANCELLED
      session.oncancel = () => {
        setLoading(false);
        setError("Payment cancelled.");
      };

      session.begin();
    } catch (err) {
      console.error("Apple Pay Error:", err);
      setError(err.message || "Apple Pay start error.");
      setLoading(false);
    }
  };

  // ---------------------------
  // UI
  // ---------------------------
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
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.5 : 1,
    }}
  ></button>

  {error && (
    <p className="text-red-500 text-xs mt-2">{error}</p>
  )}
</div>

  );
};

export default ApplePayCheckout;
