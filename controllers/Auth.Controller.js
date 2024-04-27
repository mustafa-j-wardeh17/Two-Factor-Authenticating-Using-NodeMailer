import Joi from "joi"
import { transporter } from "../utils/transporter.js"
import User from "../models/User.Model.js"
import bcrypt from 'bcrypt'
import userOTPVerfication from "../models/UserOTPVerification.Model.js"

export const registerController = async (req, res) => {
    const { email, password, confirmPassword, dateOfBirth, name } = req.body
    const { error } = registerValidation({ email, password, dateOfBirth, name })
    if (password !== confirmPassword) {
        return res.status(400).json({
            status: "FAILED",
            msg: "Oops: Passwords Doesn't Matched"
        })
    }

    if (error) {
        return res.status(400).json({
            status: "FAILED",
            msg: `Oops: ${error.details[0].message}`
        })
    }
    try {
        const findUser = await User.findOne({ email })
        if (findUser) {
            return res.status(400).json({
                status: "FAILED",
                msg: `Oops: Email Allready Taken`
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPass = await bcrypt.hash(password, salt)

        const createUser = new User({
            email,
            password: hashPass,
            dateOfBirth,
            verified: false,
            name
        })

        await createUser.save()

        // Send Verification OTP Code To Email
        sendOTPVerificationToEmail({ email, userId: createUser._id }, res)
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            msg: `Oops: Something Went Wrong While Singing Up To New Account`
        })
    }
}


export const loginController = (req, res) => {
    try {

    } catch (error) {

    }
}

export const verifyOTP = async (req, res) => {
    const { userId, otp } = req.body
    if (!userId || !otp) {
        return res.status(400).json({
            status: "FAILED",
            msg: `Oops: Empty Details Are Not Allowed To Sending OTP`
        })
    }
    const findUser = await User.findOne({ _id: userId })
    if (!findUser) {
        return res.status(400).json({
            status: "FAILED",
            msg: `Oops: User Doesn't Registered, Please Register.`
        })
    }
    console.log(`\n\n errrrorrrr\n\n`)
    const findUserOTP = await userOTPVerfication.find({ userId })
    if (findUserOTP.length <= 0) {
        return res.status(400).json({
            status: "FAILED",
            msg: `Oops: Account record doen't exist or has been verified already. Please sign up or log in.`
        })
    }

    const { expiresAt } = findUserOTP[0]
    const hashedUserOTP = findUserOTP[0].otp
    try {
        if (expiresAt < Date.now()) {
            await userOTPVerfication.deleteMany({ userId })
            return res.status(400).json({
                status: "FAILED",
                msg: `Oops: Code has expired. Please requiest again.`
            })
        }

        const validOTP = await bcrypt.compare(otp, hashedUserOTP)
        if (!validOTP) {
            return res.status(400).json({
                status: "FAILED",
                msg: `Oops: Invalid code passed. Check your inbox.`
            })
        }

        await userOTPVerfication.deleteMany({ userId })
        await User.findByIdAndUpdate(userId, {
            verified: true
        })

        res.status(200).json({
            status: "VERIFIED",
            msg: `User Verified Successfully`
        })
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            msg: `Oops: Something Went Wrong While Resending OTP`
        })
    }
}


export const resendOTPVerification = async (req, res) => {
    const { userId, email } = req.body
    if (!userId || !email) {
        return res.status(400).json({
            status: "FAILED",
            msg: `Oops: Empty Details Are Not Allowed To Resending OTP`
        })
    }
    try {
        // delete previous otp if found
        await userOTPVerfication.deleteMany({ userId })
        sendOTPVerificationToEmail({ userId, email }, res)

    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            msg: `Oops: Something Went Wrong While Resending OTP`
        })
    }
}


const sendOTPVerificationToEmail = async ({ userId, email }, res) => {
    if (!userId || !email) {
        return res.status(400).json({
            status: "FAILED",
            msg: `Oops: Empty Details Are Not Allowed To Sending OTP`
        })
    }
    try {
        const otp = `${Math.floor(Math.random() * 9000 + 1000)}` // OTP WITH 4 NUMBER DIGITS

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify Your Email", // Subject line
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete</p>
            <p>This code <b>expires in 1 hour</b>.</p>` // html body        
        }

        const salt = await bcrypt.genSalt(10)
        const hashedOTP = await bcrypt.hash(otp, salt)

        const newOTP = new userOTPVerfication({
            userId,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + (1000 * 60 * 60)
        })
        await newOTP.save()
        await transporter.sendMail(mailOptions)

        res.status(200).json({
            staus: "Pending",
            msg: "Verification otp email sent",
            // data: {
            //     userId,
            //     email
            // }
        })
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            msg: `Oops: Something Went Wrong While Sending OTP`
        })
    }
}


const registerValidation = (data) => {
    const RegisterSchema = Joi.object({
        email: Joi.string().trim().email().required(),
        name: Joi.string().trim().min(2).max(20).required(),
        password: Joi.string().trim().min(2).max(20).required(),
        dateOfBirth: Joi.required(),
    })
    return RegisterSchema.validate(data)
}