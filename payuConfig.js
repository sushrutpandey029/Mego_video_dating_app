const payuConfig = {
    key: "your_merchant_key",
    salt: "your_merchant_salt",
    baseUrl: "https://secure.payu.in", // or sandbox: https://sandboxsecure.payu.in
    successUrl: "https://yourdomain.com/payment-success",
    failureUrl: "https://yourdomain.com/payment-failure",
};

export default payuConfig;
