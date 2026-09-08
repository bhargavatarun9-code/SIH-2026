import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_DB_URI)
        console.log('MongoDb connected')
    } catch (error) {
        console.log('error in db', error)
    }
}

export default connectDB

