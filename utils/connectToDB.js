import mongoose from "mongoose";

export const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL)
        console.log('Connected To DB Successfully')
    } catch (error) {
        console.log('Oops: Something Went Wrong While Connecting To Database')
    }
}