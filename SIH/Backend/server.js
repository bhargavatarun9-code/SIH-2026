import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDB from "./src/config/db.js"
import cors from "cors"
import cookieParser from "cookie-parser";
import router from "./src/routes/auth.route.js"
import serviceRouter from "./src/routes/service.route.js";
import professionalProfileRouter from "./src/routes/professionalProfile.route.js";
import bookingRouter from "./src/routes/booking.route.js";
import reviewRouter from "./src/routes/review.route.js";
import adminRouter from "./src/routes/admin.route.js";

connectDB()

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())
app.use(cookieParser());

app.use("/api/auth", router)
app.use("/api/services", serviceRouter);
app.use("/api/professionals", professionalProfileRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRouter);

let port = process.env.PORT 

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})