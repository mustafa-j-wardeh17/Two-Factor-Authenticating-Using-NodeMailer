import express from 'express'
import dotenv from 'dotenv'
import { connectToDB } from './utils/connectToDB.js'
import { Logger } from './middleware/Logger.js'
import AuthRouter from './router/Auth.Router.js'


const app = express()
dotenv.config()

app.use(express.json())

app.use(Logger)

app.use('/auth/v1', AuthRouter)


app.listen(process.env.PORT, () => {
    try {
        console.log(`App Running Successfully On Port ${process.env.PORT}`)
        connectToDB()
    } catch (error) {
        console.log('Oops: Something Went Wrong While Launching The App')
    }
})