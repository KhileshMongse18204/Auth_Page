import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

transporter.verify((error, success) => {
  if (error) {
    if (error.code === "EAUTH" && error.message.includes("invalid_grant")) {
      console.error("Error connecting to email server:", error.message);
      console.error("\nThis means the Google refresh token is invalid or expired.");
      console.error("To fix this, run: node server/scripts/generate-refresh-token.mjs");
    } else {
      console.error("Error connecting to email server:", error);
    }
  } else {
    console.log("Email server is ready to send messages");
  }
});

export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${process.env.EMAIL_USER || process.env.GOOGLE_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
