import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your pages

import PayPalCheckout from "./PayPalCheckout";
import ApplePayCheckout from "./ApplePay/ApplePayCheckout";
import GooglePayButto from "./GooglePayButto";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<PayPalCheckout />} />
        <Route path="/google-pay" element={<GooglePayButto />} />

        {/* Apple Pay Checkout Route */}
        <Route path="/apple-pay" element={<ApplePayCheckout />} />

        <Route path="/purchaseVideoPackageWithAllPayment" element={<PayPalCheckout />} />
        <Route path="/purchaseVideoWithAllPayment" element={<PayPalCheckout />} />


        <Route path="/apple-pay/purchaseVideoPackageWithAllPayment" element={<ApplePayCheckout />} />

        <Route path="/apple-pay/purchaseVideoWithAllPayment" element={<ApplePayCheckout />} />


      </Routes>
    </Router>
  );
}

export default App;
