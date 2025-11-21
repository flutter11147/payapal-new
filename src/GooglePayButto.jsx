// /** @format */
// import React, { useEffect, useState } from "react";

// export default function GooglePayWithPayPal() {
//   const [paypalLoaded, setPaypalLoaded] = useState(false);
//   const [googleLoaded, setGoogleLoaded] = useState(false);
//   const [googlePayReady, setGooglePayReady] = useState(false);

//   let baseRequest = { apiVersion: 2, apiVersionMinor: 0 };
//   let paymentsClient = null;
//   let allowedPaymentMethods = null;
//   let merchantInfo = null;

//   /* --------------------------------------------
//      LOAD PAYPAL SDK
//   --------------------------------------------- */
//   useEffect(() => {
//     if (!document.getElementById("paypal-sdk")) {
//       const script = document.createElement("script");
//       script.id = "paypal-sdk";
//       script.src =
//         "https://www.paypal.com/sdk/js?client-id=AUEr46iZcPSPktWqUMOW3U3wAwUpYp9i8N0YBUguFIFEk2LNytTAKM73JcTO6stONNYEVl5d4DZ5zMVI&components=googlepay";
//       script.async = true;
//       script.onload = () => setPaypalLoaded(true);
//       document.body.appendChild(script);
//     } else setPaypalLoaded(true);
//   }, []);

//   /* --------------------------------------------
//      LOAD GOOGLE PAY JS
//   --------------------------------------------- */
//   useEffect(() => {
//     if (!document.getElementById("googlepay-sdk")) {
//       const script = document.createElement("script");
//       script.id = "googlepay-sdk";
//       script.src = "https://pay.google.com/gp/p/js/pay.js";
//       script.async = true;
//       script.onload = () => setGoogleLoaded(true);
//       document.body.appendChild(script);
//     } else setGoogleLoaded(true);
//   }, []);

//   /* --------------------------------------------
//      WAIT FOR PayPal.Googlepay TO BE READY
//      (THIS FIXES BUTTON NOT SHOWING)
//   --------------------------------------------- */
//   useEffect(() => {
//     if (!paypalLoaded || !googleLoaded) return;

//     const interval = setInterval(() => {
//       if (window?.paypal?.Googlepay) {
//         clearInterval(interval);
//         setGooglePayReady(true);
//       }
//     }, 300);

//     return () => clearInterval(interval);
//   }, [paypalLoaded, googleLoaded]);

//   /* --------------------------------------------
//      INIT WHEN EVERYTHING IS READY
//   --------------------------------------------- */
//   useEffect(() => {
//     if (googlePayReady) {
//       onGooglePayLoaded();
//     }
//   }, [googlePayReady]);

//   /* -------------------------------------------- */
//   async function getGooglePayConfig() {
//     if (!allowedPaymentMethods || !merchantInfo) {
//       const googlePayConfig = await window.paypal.Googlepay().config();
//       allowedPaymentMethods = googlePayConfig.allowedPaymentMethods;
//       merchantInfo = googlePayConfig.merchantInfo;
//     }
//     return { allowedPaymentMethods, merchantInfo };
//   }

//   function getGoogleIsReadyToPayRequest() {
//     return { ...baseRequest, allowedPaymentMethods };
//   }

//   function getPaymentsClient() {
//     if (!paymentsClient && window.google) {
//       paymentsClient = new window.google.payments.api.PaymentsClient({
//         environment: "TEST",
//         paymentDataCallbacks: { onPaymentAuthorized },
//       });
//     }
//     return paymentsClient;
//   }

//   async function onGooglePayLoaded() {
//     const pc = getPaymentsClient();
//     const { allowedPaymentMethods } = await getGooglePayConfig();

//     pc.isReadyToPay(getGoogleIsReadyToPayRequest())
//       .then((res) => {
//         if (res.result) addGooglePayButton();
//       })
//       .catch(console.error);
//   }

//   function addGooglePayButton() {
//     const pc = getPaymentsClient();
//     if (!pc) return;

//     const button = pc.createButton({
//       onClick: onGooglePaymentButtonClicked,
//     });

//     const container = document.getElementById("button-container");
//     if (container) {
//       container.innerHTML = "";
//       container.appendChild(button);
//     }
//   }

//   /* --------------------------------------------
//      TRANSACTION INFO
//   --------------------------------------------- */
//   function getGoogleTransactionInfo() {
//     return {
//       displayItems: [
//         { label: "Subtotal", type: "SUBTOTAL", price: "100.00" },
//         { label: "Tax", type: "TAX", price: "10.00" },
//       ],
//       countryCode: "US",
//       currencyCode: "USD",
//       totalPriceStatus: "FINAL",
//       totalPrice: "110.00",
//       totalPriceLabel: "Total",
//     };
//   }

//   async function getPaymentDataRequest() {
//     const req = { ...baseRequest };
//     const { allowedPaymentMethods, merchantInfo } = await getGooglePayConfig();

//     req.allowedPaymentMethods = allowedPaymentMethods;
//     req.transactionInfo = getGoogleTransactionInfo();
//     req.merchantInfo = merchantInfo;
//     req.callbackIntents = ["PAYMENT_AUTHORIZATION"];

//     return req;
//   }

//   async function onGooglePaymentButtonClicked() {
//     const req = await getPaymentDataRequest();
//     const pc = getPaymentsClient();
//     pc.loadPaymentData(req);
//   }

//   /* --------------------------------------------
//      PAYMENT AUTH
//   --------------------------------------------- */
//   function onPaymentAuthorized(paymentData) {
//     return new Promise((resolve) => {
//       processPayment(paymentData)
//         .then(() => resolve({ transactionState: "SUCCESS" }))
//         .catch(() => resolve({ transactionState: "ERROR" }));
//     });
//   }

//   /* --------------------------------------------
//      PROCESS ORDER
//   --------------------------------------------- */
//   async function processPayment(paymentData) {
//     try {
//       const { currencyCode, totalPrice } = getGoogleTransactionInfo();

//       const order = {
//         intent: "CAPTURE",
//         purchase_units: [
//           { amount: { currency_code: currencyCode, value: totalPrice } },
//         ],
//       };

//       const { id } = await fetch(`/orders`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(order),
//       }).then((r) => r.json());

//       const { status } = await window.paypal.Googlepay().confirmOrder({
//         orderId: id,
//         paymentMethodData: paymentData.paymentMethodData,
//       });

//       if (status === "APPROVED") {
//         await fetch(`/orders/${id}/capture`, { method: "POST" });
//         return true;
//       }

//       return false;
//     } catch (err) {
//       console.error("Payment error:", err);
//       return false;
//     }
//   }

//   return (
//     <div className="w-full flex justify-center py-10">
//       <div id="button-container" />
//     </div>
//   );
// }
/** @format */
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function GooglePayWithPayPal() {
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googlePayReady, setGooglePayReady] = useState(false);

  // ----------------------------------------
  // 🔥 REQUIRED CHANGE 1: GET orderId + accessToken from URL
  // ----------------------------------------
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");
  const accessToken = params.get("accessToken");

  console.log("Google Pay Order ID:", orderId);
  console.log("Google Pay AccessToken:", accessToken);



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

      {/* <button
        onClick={() => window.location.href = "/"}
        className="mt-5 px-5 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition"
      >
        Go Back
      </button> */}
    </div>
  );
}


  let baseRequest = { apiVersion: 2, apiVersionMinor: 0 };
  let paymentsClient = null;
  let allowedPaymentMethods = null;
  let merchantInfo = null;

  // LOAD PAYPAL SDK
  useEffect(() => {
    if (!document.getElementById("paypal-sdk")) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src =
        "https://www.paypal.com/sdk/js?client-id=Ab5nPVVXVnbaCWqBAwZ4ZJb0LdiTTVSnN3K0Z1mPfSzWJaTK-IyARFoHCX5zf0RBjvlfElWkGzcCnG6A&components=googlepay";
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      document.body.appendChild(script);
    } else setPaypalLoaded(true);
  }, []);

  // LOAD GOOGLE PAY
  useEffect(() => {
    if (!document.getElementById("googlepay-sdk")) {
      const script = document.createElement("script");
      script.id = "googlepay-sdk";
      script.src = "https://pay.google.com/gp/p/js/pay.js";
      script.async = true;
      script.onload = () => setGoogleLoaded(true);
      document.body.appendChild(script);
    } else setGoogleLoaded(true);
  }, []);

  // WAIT FOR PayPal.GooglePay
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
    if (googlePayReady) {
      onGooglePayLoaded();
    }
  }, [googlePayReady]);

  async function getGooglePayConfig() {
    if (!allowedPaymentMethods || !merchantInfo) {
      const googlePayConfig = await window.paypal.Googlepay().config();
      allowedPaymentMethods = googlePayConfig.allowedPaymentMethods;
      merchantInfo = googlePayConfig.merchantInfo;
    }
    return { allowedPaymentMethods, merchantInfo };
  }

  function getGoogleIsReadyToPayRequest() {
    return { ...baseRequest, allowedPaymentMethods };
  }

  function getPaymentsClient() {
    if (!paymentsClient && window.google) {
      paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: "TEST",
        paymentDataCallbacks: { onPaymentAuthorized },
      });
    }
    return paymentsClient;
  }

  async function onGooglePayLoaded() {
    const pc = getPaymentsClient();
    const { allowedPaymentMethods } = await getGooglePayConfig();

    pc.isReadyToPay(getGoogleIsReadyToPayRequest())
      .then((res) => {
        if (res.result) addGooglePayButton();
      })
      .catch(console.error);
  }

  function addGooglePayButton() {
    const pc = getPaymentsClient();
    if (!pc) return;

    const button = pc.createButton({
      onClick: onGooglePaymentButtonClicked,
    });

    const container = document.getElementById("button-container");
    if (container) {
      container.innerHTML = "";
      container.appendChild(button);
    }
  }

  function getGoogleTransactionInfo() {
    return {
      displayItems: [
        { label: "Subtotal", type: "SUBTOTAL", price: "100.00" },
        { label: "Tax", type: "TAX", price: "10.00" },
      ],
      countryCode: "US",
      currencyCode: "USD",
      totalPriceStatus: "FINAL",
      totalPrice: "110.00",
      totalPriceLabel: "Total",
    };
  }

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

  function onPaymentAuthorized(paymentData) {
    return new Promise((resolve) => {
      processPayment(paymentData)
        .then(() => resolve({ transactionState: "SUCCESS" }))
        .catch(() => resolve({ transactionState: "ERROR" }));
    });
  }

  // ----------------------------------------------------------
  // 🔥 REQUIRED CHANGE 2: Capture Google Pay using YOUR BACKEND
  // ----------------------------------------------------------
  async function processPayment(paymentData) {
    try {
      const body = {
        orderId,
        accessToken,
        googlePaymentMethod: paymentData.paymentMethodData,
      };

      const res = await fetch(
        "https://slotssubdomains.com/api/api/V1/paypal/captureOrder",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      console.log("Capture Response:", data);

      return true;
    } catch (err) {
      console.error("Payment error:", err);
      return false;
    }
  }

  return (
    <div className="w-full flex justify-center py-10">
      <div id="button-container" />
    </div>
  );
}
