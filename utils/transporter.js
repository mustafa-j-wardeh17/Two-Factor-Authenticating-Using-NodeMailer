import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()


export const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
})
