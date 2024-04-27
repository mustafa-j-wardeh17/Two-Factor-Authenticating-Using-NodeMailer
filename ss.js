import User from "../models/User.Model.js";
import Joi from "joi";
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import userOTPVerfication from "../models/User.OTP.Verfication.js";
import dotenv from 'dotenv'

dotenv.config()


//Nodemailer stuff
let transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: process.env.AUTH_EMAIL, // HOTMAIL email
        pass: process.env.AUTH_PASS, // HOTMAIL account password
    }
})

export const registerController = async (req, res) => {
    const { email, password, confirmPassword, dateOfBirth, name } = req.body
    if (password !== confirmPassword) {
        return res.status(401).json({
            msg: 'Oops: Passwords does not mathced'
        })
    }
    const { error } = RegisterValidation({ email, password, dateOfBirth, name })
    if (error) {
        return res.status(401).json({
            msg: `Oops:${error.details[0].message}`
        })
    }
    try {
        const findUser = await User.findOne({ email })
        if (findUser) {
            return res.status(400).json({
                msg: 'Email Allready Taken'
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const createUser = new User({
            email,
            password: hashedPassword,
            dateOfBirth,
            name,
            verified: false
        })

        await createUser.save()

        sendOTPVerficationEmail(createUser, res)
    } catch (error) {
        res.status(500).json({
            msg: 'Oops: Something Went Wrong'
        })
    }
}
export const loginController = (req, res) => {
    const { email, password } = req.body

    try {

    } catch (error) {

    }
}



export const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body
        if (!userId || !otp) {
            throw new Error("Empty otp details are not allowed")
        }
        const userOTPVerficationRecord = await userOTPVerfication.findOne({
            userId
        })

        if (!userOTPVerficationRecord) {
            throw new Error("Account record doen't exist or has been verified already. Please sign up or log in.")
        }

        const { expiresAt } = userOTPVerficationRecord
        const hashedOTP = userOTPVerficationRecord.otp

        if (expiresAt < Date.now()) {
            await userOTPVerfication.deleteMany({ userId })
            throw new Error("Code has expired. Please requiest again.")
        } else {
            const validOTP = await bcrypt.compare(otp, hashedOTP)
            if (!validOTP) {
                throw new Error("Invalid code passed. Check your inbox.")
            } else {
                await User.updateOne({ _id: userId }, {
                    verified: true
                })

                await userOTPVerfication.deleteMany({ userId })
                res.status(200).json({
                    status: "VERIFIED",
                    msg: "User email verified successfully"
                })
            }
        }

    } catch (error) {
        res.status(500).json({
            status: 'FAILED',
            msg: error.message
        })
    }
}

export const resendOTPVerification = async (req, res) => {
    try {
        const { userId, email } = req.body
        if (!userId || !email) {
            throw new Error("Empty user detailes are not allowed")
        }

        //delete existing recoeds and resend again
        await userOTPVerfication.deleteMany({ userId })
        sendOTPVerficationEmail({ _id: userId, email }, res)
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            msg: error.message
        })
    }
}

//for sign up and resend otp verification code
const sendOTPVerficationEmail = async (req, res) => {
    const { _id, email } = req
    try {
        const otp = `${Math.floor(Math.random() * 9000 + 1000)}`
        const mailOptions = {
            from: process.env.AUTH_EMAIL, // sender address
            to: email, // list of recivers
            subject: "Verify Your Email", // Subject line
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete</p>
            <p>This code <b>expires in 1 hour</b>.</p>` // html body
        }
        const salt = await bcrypt.genSalt(10)
        const hashOTP = await bcrypt.hash(otp, salt)

        const newOTPVerfication = new userOTPVerfication({
            userId: _id,
            otp: hashOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + (1000 * 60 * 60)
        })

        await newOTPVerfication.save()

        //HTML Page from 
        await transporter.sendMail(mailOptions)

        res.status(200).json({
            status: "Pending",
            msg: "Verification otp email sent",
            data: {
                userId: _id,
                email
            }
        })
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message,
            sender: process.env.AUTH_EMAIL,
        })
    }
}

const RegisterValidation = (data) => {
    const RegisterSchema = Joi.object({
        email: Joi.string().trim().email().required(),
        name: Joi.string().trim().min(2).max(20).required(),
        password: Joi.string().trim().min(2).max(20).required(),
        dateOfBirth: Joi.required(),
    })
    return RegisterSchema.validate(data)
}