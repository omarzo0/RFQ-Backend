const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/v1";

async function testOTPFlow() {
  try {
    console.log("🧪 Testing OTP Password Reset Flow...\n");

    // Step 1: Request OTP
    console.log("1️⃣ Requesting OTP for admin@example.com...");
    const requestResponse = await axios.post(
      `${BASE_URL}/admin/auth/forgot-password`,
      {
        email: "omarkhaled202080@gmail.com",
      }
    );

    console.log("✅ OTP Request Response:", requestResponse.data);

    // In development, the OTP should be returned in the response
    const otp = requestResponse.data.data?.otp;

    if (otp) {
      console.log(`\n🔑 OTP received: ${otp}`);

      // Step 2: Verify OTP
      console.log("\n2️⃣ Verifying OTP...");
      const verifyResponse = await axios.post(
        `${BASE_URL}/admin/auth/verify-otp`,
        {
          email: "admin@example.com",
          otp: otp,
        }
      );

      console.log("✅ OTP Verification Response:", verifyResponse.data);

      // Step 3: Reset Password
      console.log("\n3️⃣ Resetting password with OTP...");
      const resetResponse = await axios.post(
        `${BASE_URL}/admin/auth/reset-password`,
        {
          email: "admin@example.com",
          otp: otp,
          newPassword: "NewPassword123!",
        }
      );

      console.log("✅ Password Reset Response:", resetResponse.data);
    } else {
      console.log("❌ No OTP received in response. Check email configuration.");
    }
  } catch (error) {
    console.error(
      "❌ Error testing OTP flow:",
      error.response?.data || error.message
    );
  }
}

testOTPFlow();
