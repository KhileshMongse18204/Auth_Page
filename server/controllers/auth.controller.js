import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { truncate } from "fs";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import OtpModel from "../models/otp.model.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";

export async function register(req, res) {
    const { username, email, password } = req.body;

    const isalreadyExist = await userModel.findOne({
        $or: [{ username }, { email }]
    });


    if (isalreadyExist) {
        return res.status(400).json({ message: "Username or email already exists" });
    }

    const hashadpassword = crypto.createHash("sha256").update(password).digest("hex");

    const user = await userModel.create({
        username,
        email,
        password: hashadpassword
    })

 const otp = generateOtp();
 const html = getOtpHtml(otp);

 const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
 await OtpModel.create({_id: user._id, email, user: user._id, otpHash});

 await sendEmail(email, "Your OTP Code", `Your OTP code is: ${otp}`, html);


    // const refreshtoken = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" })

    // const refreshTokenHash = crypto.createHash("sha256").update(refreshtoken).digest("hex");

    // const session = await sessionModel.create({
    //     userId: user._id,
    //     refreshTokenHash,
    //     ip: req.ip,
    //     userAgent: req.headers["user-agent"]
    // });

    // const accesstoken = jwt.sign({ id: user._id, sessionId: session._id }, config.JWT_SECRET, { expiresIn: "15m" })

    // res.cookie("refreshtoken", refreshtoken, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: "strict",
    //     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    // });
    res.status(201).json({
        message: "User registered successfully",
        user: {
            username: user.username,
            email: user.email,
            verified: user.verified,
            id: user._id
        },

    });
}

export async function login(req, res) {
    const { email, password } = req.body
    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.verified) {
        return res.status(400).json({ message: "Please verify your email before logging in" });
    }

    const hashadpassword = crypto.createHash("sha256").update(password).digest("hex")

    const isPasswordValid = hashadpassword === user.password;

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const refreshtoken = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" })

    const refreshTokenHash = crypto.createHash("sha256").update(refreshtoken).digest("hex")

    const session = await sessionModel.create({
        userId: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })

    const accesstoken = jwt.sign({ id: user._id, sessionId: session._id }, config.JWT_SECRET, { expiresIn: "15m" })
    res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(200).json({
        message: "User logged in successfully",
        user: {
            username: user.username,
            email: user.email,
            id: user._id
        },
        accesstoken
    });
}

export async function getMe(req, res) {

    const tokens = req.headers.authorization?.split(" ")[1];

    if (!tokens) {
        return res.status(401).json({ message: "Authorization token is missing" });
    }

    const decoded = jwt.verify(tokens, config.JWT_SECRET)

    const user = await userModel.findById(decoded.id).select("-password");
    res.status(200).json({
        message: "User fetched successfully",
        user: {
            username: user.username,
            email: user.email,
        }
    })
}

export async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshtoken;
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is missing" });
    }
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if (!session) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accesstoken = jwt.sign({ id: decoded.id }, config.JWT_SECRET, { expiresIn: "15m" })


    const newRefreshToken = jwt.sign({ id: decoded.id }, config.JWT_SECRET, { expiresIn: "7d" })

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex")

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie("refreshtoken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(200).json({
        message: "Access token refreshed successfully",
        accesstoken
    });

}


export async function logout(req, res) {
    const refreshToken = req.cookies.refreshtoken;
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is missing" });
    }


    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne
        ({
            refreshTokenHash,
            revoked: false

        })

    if (!session) {
        return res.status(401).json({ message: "Invalid refresh token" });

    }
    session.revoked = true;
    await session.save();

    res.clearCookie("refreshtoken")

    res.status(200).json({
        message: "Logged out successfully"
    })

}

export async function logoutAll(req, res) {
    const refreshToken = req.cookies.refreshtoken

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is missing" });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    await sessionModel.updateMany({ userId: decoded.id }, { revoked: true })
    res.clearCookie("refreshtoken")

    res.status(200).json({
        message: "Logged out from all sessions successfully"
    })
}

export async function verifyEmail(req, res) {
    const   { email, otp } = req.body

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex")

    const otpDoc = await OtpModel.findOne({ email, otpHash })

    if (!otpDoc) {
        return res.status(400).json({ message: "Invalid OTP" });
    }
    const user = await userModel.findByIdAndUpdate(otpDoc.user, {
        verified: true
    }, { new: true })

    await OtpModel.deleteMany({ 
user: otpDoc.user           
     })

     return res.status(200).json({
        message: "Email verified successfully",
        user: {
            username: user.username,
            email: user.email,
            verified: user.verified
        }
    })

}