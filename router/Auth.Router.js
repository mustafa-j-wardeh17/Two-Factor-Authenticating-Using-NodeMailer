import express from 'express'
import { loginController, registerController, resendOTPVerification, verifyOTP } from '../controllers/Auth.Controller.js'

const AuthRouter = express.Router()

AuthRouter.post('/register', registerController)
AuthRouter.post('/login', loginController)
AuthRouter.post('/verifyOTP', verifyOTP)
AuthRouter.post('/resendVerifyOTP', resendOTPVerification)

export default AuthRouter