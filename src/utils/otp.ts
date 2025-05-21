import axios from "axios";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (phoneNumber: string, otp: string) => {
  try {
    const response = await axios.post(
      "https://api.msg91.com/api/v5/otp",
      {
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: phoneNumber,
        otp: otp,
      },
      {
        headers: {
          "Content-Type": "application/json",
          authkey: process.env.MSG91_AUTH_KEY,
        },
      }
    );

    if (response.data.type !== "success") {
      throw new Error("Failed to send OTP");
    }

    return true;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};
