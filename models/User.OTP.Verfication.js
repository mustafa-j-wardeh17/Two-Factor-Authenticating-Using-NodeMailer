import mongoose from "mongoose";

const userOTPVerficationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
})

const userOTPVerficationModel = mongoose.model('userOTPVerfication', userOTPVerficationSchema)

export default userOTPVerficationModel