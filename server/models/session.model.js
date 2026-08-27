import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: [ true, "User ID is required"]
    },
    refreshTokenHash: {
        type: String,
        required: [ true, "Refresh token hash is required"]
    },
    userAgent: {
        type: String,
        required: [ true, "User agent is required"]
    },
    revoked: {
        type: Boolean,
        default: false
    }
},{ timestamps: true }
)

const SessionModel = mongoose.model("Sessions", sessionSchema);

export default SessionModel;