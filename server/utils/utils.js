import nodemailer from "nodemailer";

export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpHtml(otp) {
    return `
        <h1>Your OTP Code</h1>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
    `;
}

export async function generateRefreshToken() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const user = process.env.GOOGLE_USER;
    const redirectUri = "https://developers.google.com/oauthplayground";

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fmail.google.com%2F&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${encodeURIComponent(clientId)}`;

    console.log("\n=== Generate Google OAuth2 Refresh Token ===\n");
    console.log("1. Open this URL in your browser:\n");
    console.log(authUrl + "\n");
    console.log("2. Sign in with the Gmail account you want to send emails from:", user);
    console.log("\n3. Grant permission to the app.");
    console.log("\n4. After redirecting to the OAuth2 Playground, copy the authorization code from the URL.");
    console.log("\n5. Run the following command to exchange the code for a refresh token:\n");
    console.log(`curl -X POST "https://oauth2.googleapis.com/token" -d "code=<AUTHORIZATION_CODE>&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&redirect_uri=${encodeURIComponent(redirectUri)}&grant_type=authorization_code"\n`);
}
