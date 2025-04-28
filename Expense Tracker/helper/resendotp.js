const emailVerifyModel = require("../models/otp.model");
const sendEmailVerificationOTP = require("./emailOtpVerify");



const resendOtp = async (user) => {
  await emailVerifyModel.deleteMany({ userId: user._id });
  await sendEmailVerificationOTP(user);
};

module.exports = resendOtp;
