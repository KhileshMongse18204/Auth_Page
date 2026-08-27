import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ path: ".env" });

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_USER = process.env.GOOGLE_USER;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_USER) {
  console.error("Missing required environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_USER");
  process.exit(1);
}

if (GOOGLE_REFRESH_TOKEN) {
  console.log("Testing existing refresh token for:", GOOGLE_USER);
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: GOOGLE_USER,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: GOOGLE_REFRESH_TOKEN,
      },
    });

    await transporter.verify();
    console.log("SUCCESS: Refresh token is valid!");
    process.exit(0);
  } catch (error) {
    console.error("FAILED: Existing refresh token is invalid.");
    console.error("Error:", error.message);
    console.error("\nYou need to generate a new refresh token.");
  }
}

console.log("\n=== Generate Google OAuth2 Refresh Token ===\n");

const redirectUri = "https://developers.google.com/oauthplayground";
const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent&scope=${encodeURIComponent("https://mail.google.com/")}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}`;

console.log("1. Open this URL in your browser:\n");
console.log(authUrl + "\n");

console.log("2. Sign in with the Gmail account:", GOOGLE_USER);
console.log("3. Grant permission to the app.");
console.log("4. After redirecting to the OAuth2 Playground, copy the authorization code from the URL.");
console.log("5. Exchange the code for a refresh token using curl:\n");

const curlCommand = `curl -X POST "https://oauth2.googleapis.com/token" -d "code=<AUTHORIZATION_CODE>&client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&client_secret=${encodeURIComponent(GOOGLE_CLIENT_SECRET)}&redirect_uri=${encodeURIComponent(redirectUri)}&grant_type=authorization_code"`;

console.log(curlCommand + "\n");
console.log("6. Copy the 'refresh_token' value from the response and update it in your .env file.");
