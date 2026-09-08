import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        await mongoose.connect('mongodb://localhost:27017/SIH-2026')
        console.log('MongoDb connected')
    } catch (error) {
        console.log('error in db', error)
    }
}

export default connectDB

