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

/**
 * Send contact form message to admin/principal
 */
export const sendContactFormEmail = async ({ name, email, phone, subject, message }) => {
  try {
    const transporter = createTransporter();

    const toEmail =
      process.env.CONTACT_RECEIVER_EMAIL ||
      process.env.SMTP_USER ||
      process.env.EMAIL_USER;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "School Website Contact"}" <${
        process.env.SMTP_USER || process.env.EMAIL_USER
      }>`,
      to: toEmail,
      subject: `New Contact Message: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px">
          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden">
            <div style="background:#2563eb;color:white;padding:20px;text-align:center">
              <h2>New Website Contact Message</h2>
            </div>
            <div style="padding:24px;color:#333">
              <p>You have received a new message from the public website contact form.</p>
              <table style="width:100%;margin-top:16px;border-collapse:collapse">
                <tr>
                  <td style="padding:8px 0;font-weight:bold;width:120px;">Name:</td>
                  <td style="padding:8px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Email:</td>
                  <td style="padding:8px 0;">${email}</td>
                </tr>
                ${
                  phone
                    ? `<tr>
                        <td style="padding:8px 0;font-weight:bold;">Phone:</td>
                        <td style="padding:8px 0;">${phone}</td>
                      </tr>`
                    : ""
                }
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Subject:</td>
                  <td style="padding:8px 0;">${subject}</td>
                </tr>
              </table>

              <div style="margin-top:24px;">
                <p style="font-weight:bold;margin-bottom:8px;">Message:</p>
                <div style="padding:12px 16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;white-space:pre-wrap;">
                  ${message}
                </div>
              </div>
            </div>
            <div style="text-align:center;font-size:12px;color:#999;padding-bottom:16px">
              Sent automatically from the school website contact form
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Contact form email sent");
    return true;
  } catch (error) {
    console.error("❌ Contact form email failed:", error.message);
    throw new Error("Failed to send contact email");
  }
};
