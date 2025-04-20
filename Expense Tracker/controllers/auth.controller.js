const userModel = require("../models/user.model");
const emailVerifyModel = require("../models/otp.model");
const sendEmailVerificationOTP = require("../helper/emailOtpVerify");
const sendWelcomeEmail = require("../helper/sendWelcomeEmail");
const transporter=require('../config/email.config')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AuthController {
  async registerUser(req, res) {
    try {
      const { firstName, lastName, password, confirmPassword, email } =
        req.body;
      const hasedPassword = await bcrypt.hash(password, 10);

      if (!firstName || !lastName || !password || !confirmPassword || !email) {
        return res.status(400).json({
          success: false,
          message: "All Feild Required",
        });
      }

      let isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return res.status(400).json({
          success: false,
          message: "Email Already Exists",
        });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }

      let user = await userModel.create({
        firstName,
        lastName,
        password: hasedPassword,
        email,
      });
      sendEmailVerificationOTP(user);
      if (user) {
        return res.status(200).json({
          success: true,
          message: "User Created Successfully",
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
        });
      }
    } catch (e) {
      console.error("Error in createUser:", error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again.",
      });
    }
  }

  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res
          .status(400)
          .json({ status: false, message: "All fields are required" });
      }
      const existingUser = await userModel.findOne({ email });

      if (!existingUser) {
        return res.status(404).json({
          status: false,
          message: "Email doesn't exists",
        });
      }
      if (existingUser.isVerified) {
        return res.status(400).json({
          status: false,
          message: "Email is already verified",
        });
      }

      const emailVerification = await emailVerifyModel.findOne({
        userId: existingUser._id,
        otp,
      });
      if (!emailVerification) {
        if (!existingUser.isVerified) {
          // console.log(existingUser);
          await sendEmailVerificationOTP(existingUser);
          return res.status(400).json({
            status: false,
            message: "Invalid OTP, new OTP sent to your email",
          });
        }
        return res.status(400).json({ status: false, message: "Invalid OTP" });
      }
      const currentTime = new Date();
      // 15 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).
      const expirationTime = new Date(
        emailVerification.createdAt.getTime() + 15 * 60 * 1000
      );
      if (currentTime > expirationTime) {
        // OTP expired, send new OTP
        await sendEmailVerificationOTP(req, existingUser);
        return res.status(400).json({
          status: "failed",
          message: "OTP expired, new OTP sent to your email",
        });
      }
      // OTP is valid and not expired, mark email as verified
      existingUser.isVerified = true;
      await existingUser.save();
      await sendWelcomeEmail(existingUser);
      // Delete email verification document
      await emailVerifyModel.deleteMany({ userId: existingUser._id });
      return res
        .status(200)
        .json({ status: true, message: "Email verified successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Unable to verify email, please try again later",
      });
    }
  }

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          status: false,
          message: "All Feild Required",
        });
      }
      let user = await userModel.findOne({ email, isDeleted: false });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }
      if (!user.isVerified) {
        return res
          .status(401)
          .json({ status: false, message: "Your account is not verified" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }
      const token = jwt.sign({ userId: user._id,email:user.email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    } catch (e) {
      console.error("Error in loginUser:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async forgetPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      const link = `${process.env.LOCAL_PORT_URL}/reset-password/${token}`;
      const mailOptions = {
        to: email,
        subject: "Password Reset",
        html: `<p>Hello ${user.name},</p>
                <p>Click the link below to reset your password:</p>
                <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>Thank you!</p>
                <p>Best regards,</p>
                <p>Team XYZ</p>
                <p><small>This is an automatically generated email. Please do not reply to this email.</small></p>
                <p><small>© 2025 Team Papai. All rights reserved.</small></p>
                <p><small>Powered by Papai</small></p>
                <p><small>Version 1.0</small></p>`,
      };
      await transporter.sendMail(mailOptions);
      return res
        .status(200)
        .json({
          message:
            "Email sent successfully, Check mail to change your password",
        });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server Error", error: error.message });
    }
  }

  async updatePassword(req, res) {
    try {
     
      const user_id = req.user.userId;
      
 
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({
          message: "Password is required",
        });
      }
      const userdata = await userModel.findOne({ _id: user_id });
      console.log("userdata", userdata);
      if (userdata) {
        const newPassword = await bcrypt.hash(password,10);
        const updateuser = await userModel.findOneAndUpdate(
          { _id: user_id },
          {
            $set: {
              password: newPassword,
            },
          }
        );
        res.status(200).json({
          message: "Password updated successfully",
          status: 200,
        });
      } else {
        res.status(400).json({
          success:false,
          message: "password not updated",
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await userModel.findOne({ _id: decoded.userId });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
      return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server Error", error: error.message });
    }
  }
}

module.exports = new AuthController();
