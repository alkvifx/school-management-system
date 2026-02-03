import nodemailer from "nodemailer";

/**
 * Create reusable SMTP transporter (Render-safe)
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const secure = port === 465;

  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("SMTP credentials missing. Check environment variables.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false, // Render-friendly
    },
  });

  return transporter;
};

/**
 * Send email verification OTP
 */
export const sendEmailVerificationOTP = async (email, name, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "School Management System"}" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px">
          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden">
            <div style="background:#667eea;color:white;padding:20px;text-align:center">
              <h2>Email Verification</h2>
            </div>
            <div style="padding:30px;color:#333">
              <p>Hi ${name},</p>
              <p>Your email verification OTP is:</p>
              <h1 style="letter-spacing:6px;color:#667eea">${otp}</h1>
              <p>This OTP is valid for <b>10 minutes</b>.</p>
              <p>If you didn’t request this, you can safely ignore this email.</p>
            </div>
            <div style="text-align:center;font-size:12px;color:#999;padding-bottom:20px">
              Automated message — please don’t reply
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email verification OTP sent");
    return true;
  } catch (error) {
    console.error("❌ Email verification OTP failed:", error.message);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Send password reset OTP
 */
export const sendPasswordResetOTP = async (email, name, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "School Management System"}" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px">
          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden">
            <div style="background:#f5576c;color:white;padding:20px;text-align:center">
              <h2>Password Reset</h2>
            </div>
            <div style="padding:30px;color:#333">
              <p>Hi ${name},</p>
              <p>Your password reset OTP is:</p>
              <h1 style="letter-spacing:6px;color:#f5576c">${otp}</h1>
              <p>This OTP is valid for <b>10 minutes</b>.</p>
              <p style="color:red"><b>If you didn’t request this, ignore immediately.</b></p>
            </div>
            <div style="text-align:center;font-size:12px;color:#999;padding-bottom:20px">
              Automated message — please don’t reply
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Password reset OTP sent");
    return true;
  } catch (error) {
    console.error("❌ Password reset OTP failed:", error.message);
    throw new Error("Failed to send password reset email");
  }
};
