import mongoose from "mongoose";


const OtpSchema = mongoose.Schema(
    {
        userId: String,
        otp: String,
        createdAt: Date,
        expiresAt: Date
    }
)

const OtpModel = mongoose.model('otp',OtpSchema)

export default OtpModel
