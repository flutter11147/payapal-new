// /** @format */
// import React, { useState } from "react";
// import axios from "axios";
// import {
//   PayPalScriptProvider,
//   PayPalButtons,
//   PayPalCardFieldsProvider,
//   PayPalCardFieldsForm,
// } from "@paypal/react-paypal-js";

// const apiBase = "https://slotsubdomains.com/api/api/V1";

// const initialOptions = {
//   "client-id":
//     "AUEr46iZcPSPktWqUMOW3U3wAwUpYp9i8N0YBUguFIFEk2LNytTAKM73JcTO6stONNYEVl5d4DZ5zMVI",
//   currency: "USD",
//   intent: "capture",
//   components: "buttons,card-fields,funding-eligibility",
//   "enable-funding": "venmo,card",
// };

// export default function PayPalCheckout() {
//   const [message, setMessage] = useState("");
//   const [amount] = useState("10.00");
//   const [accessToken, setAccessToken] = useState("");

//   // ---------------------- 1. GET ACCESS TOKEN ----------------------
//   const getAccessToken = async () => {
//     try {
//       const res = await axios.post(`${apiBase}/Paypal/getAccessTokens`);
//       const token = res?.data?.accessToken;
//       setAccessToken(token);
//       return token;
//     } catch (err) {
//       console.error("Access token error:", err);
//       setMessage("Failed to get access token.");
//       throw err;
//     }
//   };

//   // ---------------------- 2. CREATE ORDER ----------------------
//   const createOrder = async (token) => {
//     try {
//       const body = { amount, accessToken: token };
//       const response = await axios.post(`${apiBase}/paypal/createOrder`, body, {
//         headers: { "Content-Type": "application/json" },
//       });

//       console.log("Create Order Response:", response.data);

//       // Handle your backend’s different response shapes:
//       let orderId;

//       if (response?.data?.id?.id) orderId = response.data.id.id;
//       else if (response?.data?.id) orderId = response.data.id;
//       else if (response?.data?.orderId) orderId = response.data.orderId;
//       else if (response?.data?.orderID) orderId = response.data.orderID;

//       console.log("Extracted Order ID:", orderId);

//       if (!orderId) throw new Error("Invalid order ID in API response");

//       return orderId;
//     } catch (err) {
//       console.error("Create order error:", err);
//       setMessage("Failed to create order: " + (err.response?.data?.message || err.message));
//       throw err;
//     }
//   };

//   // PayPal wrapper
//   const handleCreateOrder = async () => {
//     try {
//       const token = accessToken || (await getAccessToken());
//       return await createOrder(token);
//     } catch (err) {
//       console.error("handleCreateOrder error:", err);
//       throw err;
//     }
//   };

//   // ---------------------- 3. CAPTURE ORDER (FIXED FOR YOUR API) ----------------------
//   const captureOrder = async (orderID) => {
//     try {
//       console.log("Capturing order:", orderID);

//       const response = await axios.post(
//         `${apiBase}/paypal/captureOrder/${orderID}`,
//         {},
//         { headers: { "Content-Type": "application/json" } }
//       );

//       console.log("Capture response:", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("Capture order error:", err);
//       setMessage("Failed to capture order: " + (err.response?.data?.message || err.message));
//       throw err;
//     }
//   };

//   const handleCaptureOrder = async (data) => {
//     try {
//       console.log("onApprove data:", data);
//       return await captureOrder(data.orderID);
//     } catch (err) {
//       console.error("handleCaptureOrder error:", err);
//       throw err;
//     }
//   };

//   // ====================================================================
//   // UI + PAYPAL BUTTONS + CARD FIELDS + VENMO
//   // ====================================================================
//   return (
//     <PayPalScriptProvider options={initialOptions}>
//       <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
//         <h2>PayPal + Card + Venmo Payment</h2>

//         {/* ---------------------- PayPal ---------------------- */}
//         <h3>Pay with PayPal</h3>
//         <PayPalButtons
//           fundingSource="paypal"
//           style={{ layout: "vertical" }}
//           createOrder={handleCreateOrder}
//           onApprove={async (data) => {
//             setMessage("Capturing PayPal payment...");
//             try {
//               await handleCaptureOrder(data);
//               setMessage("✅ PayPal Payment Successful!");
//             } catch {
//               setMessage("❌ PayPal capture failed");
//             }
//           }}
//           onError={(err) => {
//             console.error("PayPal button error:", err);
//             setMessage("❌ Error: " + err.message);
//           }}
//         />

//         {/* ---------------------- Card Fields ---------------------- */}
//         <h3 style={{ marginTop: "30px" }}>Pay with Debit / Credit Card</h3>

//         <PayPalCardFieldsProvider
//           createOrder={handleCreateOrder}
//           onApprove={async (data) => {
//             setMessage("Capturing Card payment...");
//             try {
//               await handleCaptureOrder(data);
//               setMessage("✅ Card Payment Successful!");
//             } catch {
//               setMessage("❌ Card capture failed");
//             }
//           }}
//           onError={(err) => {
//             console.error("Card fields error:", err);
//             setMessage("❌ Error: " + err.message);
//           }}
//         >
//           <PayPalCardFieldsForm
//             style={{
//               input: {
//                 height: "40px",
//                 padding: "10px",
//                 border: "1px solid #ccc",
//                 borderRadius: "5px",
//               },
//             }}
//           />
//         </PayPalCardFieldsProvider>

//         {/* ---------------------- Venmo ---------------------- */}
//         <h3 style={{ marginTop: "30px" }}>Pay with Venmo</h3>
//         <PayPalButtons
//           fundingSource="venmo"
//           style={{ layout: "vertical" }}
//           createOrder={handleCreateOrder}
//           onApprove={async (data) => {
//             setMessage("Capturing Venmo payment...");
//             try {
//               await handleCaptureOrder(data);
//               setMessage("✅ Venmo Payment Successful!");
//             } catch {
//               setMessage("❌ Venmo capture failed");
//             }
//           }}
//           onError={(err) => {
//             console.error("Venmo button error:", err);
//             setMessage("❌ Error: " + err.message);
//           }}
//         />

//         {/* ---------------------- Status Message ---------------------- */}
//         {message && (
//           <div
//             style={{
//               marginTop: "20px",
//               padding: "15px",
//               backgroundColor: message.includes("✅")
//                 ? "#d4edda"
//                 : message.includes("❌")
//                 ? "#f8d7da"
//                 : "#d1ecf1",
//               border: `1px solid ${
//                 message.includes("✅")
//                   ? "#c3e6cb"
//                   : message.includes("❌")
//                   ? "#f5c6cb"
//                   : "#bee5eb"
//               }`,
//               borderRadius: "5px",
//               fontWeight: "bold",
//             }}
//           >
//             {message}
//           </div>
//         )}
//       </div>
//     </PayPalScriptProvider>
//   );
// }



// /** @format */
// import React, { useState } from "react";
// import axios from "axios";
// import {
//   PayPalScriptProvider,
//   PayPalButtons,
//   PayPalCardFieldsProvider,
//   PayPalCardFieldsForm,
// } from "@paypal/react-paypal-js";

// const apiBase = "https://slotsubdomains.com/api/api/V1";

// const initialOptions = {
//   "client-id":
//     "Ab5nPVVXVnbaCWqBAwZ4ZJb0LdiTTVSnN3K0Z1mPfSzWJaTK-IyARFoHCX5zf0RBjvlfElWkGzcCnG6A",
//   currency: "USD",
//   intent: "capture",
//   components: "buttons,card-fields,funding-eligibility",
//   "enable-funding": "venmo,card",
// };

// export default function PayPalCheckout() {
//   const [message, setMessage] = useState("");
//   const [amount] = useState("10.00");
//   const [accessToken, setAccessToken] = useState("");



  

//   // ---------------------- 1. GET ACCESS TOKEN ----------------------
//   const getAccessToken = async () => {
//     try {
//       const res = await axios.post(`${apiBase}/Paypal/getAccessTokens`);
//       const token = res?.data?.accessToken;
//       setAccessToken(token);
//       return token;
//     } catch (err) {
//       console.error("Access token error:", err);
//       setMessage("Failed to get access token.");
//       throw err;
//     }
//   };

//   // ---------------------- 2. CREATE ORDER (FIXED) ----------------------
//   const createOrder = async (token) => {
//     try {
//       const body = { amount, accessToken: token };
//       const response = await axios.post(`${apiBase}/paypal/createOrder`, body, {
//         headers: { "Content-Type": "application/json" },
//       });

//       console.log("Create Order Response:", response.data);

//       // FIX: Check different possible response structures
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
//         console.error("Full response structure:", JSON.stringify(response.data, null, 2));
//         throw new Error("Invalid order ID response - check console for full response");
//       }

//       return orderId;
//     } catch (err) {
//       console.error("Create order error:", err);
//       setMessage("Failed to create order: " + (err.response?.data?.message || err.message));
//       throw err;
//     }
//   };

//   // ---------------------- 3. CAPTURE ORDER (FIXED) ----------------------
//   const captureOrder = async (orderID, token) => {
//     try {
//       console.log("Capturing order:", orderID);
      
//       const body = { orderID, accessToken: token };

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
//       console.error("Capture order error:", err);
//       setMessage("Failed to capture order: " + (err.response?.data?.message || err.message));
//       throw err;
//     }
//   };

//   // Wrapper for PayPal's createOrder (PayPal expects a function that returns order ID)
//   const handleCreateOrder = async () => {
//     try {
//       const token = accessToken || (await getAccessToken());
//       const orderId = await createOrder(token);
//       console.log("Returning order ID to PayPal:", orderId);
//       return orderId;
//     } catch (err) {
//       console.error("handleCreateOrder error:", err);
//       throw err;
//     }
//   };

//   // Wrapper for captureOrder
//   const handleCaptureOrder = async (data) => {
//     try {
//       console.log("onApprove data:", data);
//       const token = accessToken || (await getAccessToken());
//       const result = await captureOrder(data.orderID, token);
//       return result;
//     } catch (err) {
//       console.error("handleCaptureOrder error:", err);
//       throw err;
//     }
//   };

//   return (
//     <PayPalScriptProvider options={initialOptions}>
//       <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
//         {/* <h2>PayPal + Card + Venmo Payment</h2> */}

//         {/* ---------------------- PayPal ---------------------- */}
//         {/* <h3>Pay with PayPal</h3> */}
//         <PayPalButtons
//           fundingSource="paypal"
//           style={{ layout: "vertical" }}
//           createOrder={handleCreateOrder}
//           onApprove={async (data) => {
//             setMessage("Capturing PayPal payment...");
//             try {
//               await handleCaptureOrder(data);
//               setMessage("✅ PayPal Payment Successful!");
//             } catch (err) {
//               setMessage("❌ PayPal capture failed");
//             }
//           }}
//           onError={(err) => {
//             console.error("PayPal button error:", err);
//             setMessage("❌ Error: " + err.message);
//           }}
//         />

//         {/* ---------------------- Card Fields ---------------------- */}
//         {/* <h3 style={{ marginTop: "30px" }}>Pay with Debit / Credit Card</h3> */}
//         {/* <PayPalCardFieldsProvider
//           createOrder={handleCreateOrder}
//           onApprove={async (data) => {
//             setMessage("Capturing Card payment...");
//             try {
//               await handleCaptureOrder(data);
//               setMessage("✅ Card Payment Successful!");
//             } catch (err) {
//               setMessage("❌ Card capture failed");
//             }
//           }}
//           onError={(err) => {
//             console.error("Card fields error:", err);
//             setMessage("❌ Error: " + err.message);
//           }}
//         >
//           <PayPalCardFieldsForm
//             style={{
//               input: {
//                 height: "40px",
//                 padding: "10px",
//                 border: "1px solid #ccc",
//                 borderRadius: "5px",
//               },
//             }}
//           />
//         </PayPalCardFieldsProvider> */}

//         {/* ---------------------- Venmo ---------------------- */}
//         {/* <h3 style={{ marginTop: "30px" }}>Pay with Venmo</h3> */}
//         <PayPalButtons
//           fundingSource="venmo"
//           style={{ layout: "vertical" }}
//           createOrder={handleCreateOrder}
//           onApprove={async (data) => {
//             setMessage("Capturing Venmo payment...");
//             try {
//               await handleCaptureOrder(data);
//               setMessage("✅ Venmo Payment Successful!");
//             } catch (err) {
//               setMessage("❌ Venmo capture failed");
//             }
//           }}
//           onError={(err) => {
//             console.error("Venmo button error:", err);
//             setMessage("❌ Error: " + err.message);
//           }}
//         />

//         {/* ---------------------- Status message ---------------------- */}
//         {message && (
//           <div style={{ 
//             marginTop: "20px", 
//             padding: "15px",
//             backgroundColor: message.includes("✅") ? "#d4edda" : message.includes("❌") ? "#f8d7da" : "#d1ecf1",
//             border: `1px solid ${message.includes("✅") ? "#c3e6cb" : message.includes("❌") ? "#f5c6cb" : "#bee5eb"}`,
//             borderRadius: "5px",
//             fontWeight: "bold"
//           }}>
//             {message}
//           </div>
//         )}
//       </div>
//     </PayPalScriptProvider>
//   );
// }







/** @format */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";

const apiBase = "https://slotsubdomains.com/api/api/V1";

const initialOptions = {
  "client-id": "Ab5nPVVXVnbaCWqBAwZ4ZJb0LdiTTVSnN3K0Z1mPfSzWJaTK-IyARFoHCX5zf0RBjvlfElWkGzcCnG6A",
  currency: "USD",
  intent: "capture",
  components: "buttons,funding-eligibility",
  "enable-funding": "venmo,card",
};

export default function PayPalCheckout() {
  const [message, setMessage] = useState("");

  // -------------------------------------------
  // GET ORDER ID & TOKEN FROM URL
  // -------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");
  const accessToken = params.get("accessToken");
//   const orderId = "8DE22138RE199460J"
//   const accessToken ="A21AANFaIL4rRZvVQEDwU4nr3PhzF44p0ltGtKCtaXRzGObMwVRfjtEGOfvGyQVeA8BNhrlR_KkK-DrhftXman7LyREU-t1TQ"

  console.log("Order ID From URL:", orderId);
  console.log("Access Token From URL:", accessToken);
  // console.log('event.validationURL',event.validationURL)

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


  // -------------------------------------------
  // CAPTURE ORDER (Backend API)
  // -------------------------------------------
  const captureOrder = async () => {
    try {
      const body = { orderId, accessToken };

      const response = await axios.post(
        `${apiBase}/paypal/captureOrder`,
        body,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Capture Response:", response.data);
      return response.data;

    } catch (err) {
      console.error("Capture Error:", err);
      throw new Error(
        err.response?.data?.message || "Capture failed"
      );
    }
  };

  return (
  <PayPalScriptProvider options={initialOptions}>
  <div className="max-w-md mx-auto p-6 flex flex-col items-center justify-center">

    {/* PAYPAL BUTTON */}
    <div className="w-full flex justify-center mb-4">
      <PayPalButtons
        fundingSource="paypal"
        style={{ layout: "vertical" }}
        createOrder={async () => {
          console.log("Returning Existing Order From URL:", orderId);
          return orderId;
        }}
        onApprove={async () => {
          setMessage("Capturing PayPal Payment...");
          try {
            await captureOrder();
            setMessage("✅ Payment Successful!");
          } catch (e) {
            setMessage("❌ Capture Failed: " + e.message);
          }
        }}
        onError={(err) => {
          console.error("PayPal Error:", err);
          setMessage("❌ Error: " + err.message);
        }}
      />
    </div>

    {/* VENMO BUTTON */}
    <div className="w-full flex justify-center mb-4">
      <PayPalButtons
        fundingSource="venmo"
        style={{ layout: "vertical" }}
        createOrder={async () => orderId}
        onApprove={async () => {
          setMessage("Capturing Venmo Payment...");
          try {
            await captureOrder();
            setMessage("✅ Venmo Payment Successful!");
          } catch (e) {
            setMessage("❌ Venmo Capture Failed");
          }
        }}
      />
    </div>

    {/* STATUS MESSAGE */}
    {message && (
      <div
        className={`mt-4 w-full max-w-sm text-center font-semibold p-3 rounded 
          ${
            message.includes("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
      >
        {message}
      </div>
    )}
  </div>
</PayPalScriptProvider>

  );
}
