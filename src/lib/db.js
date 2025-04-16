import mongoose from "mongoose";

export const connectDB = async () => {
    try {
       const conn = await mongoose.connect(process.env.MONGOURI);
        console.log(`DataBase Connected ${conn.connection.host}`);
    } catch (error) {
        process.exit(1)
    }
}