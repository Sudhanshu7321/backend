import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes.js";
import cookieParser from 'cookie-parser'
import problemRoutes from "./routes/problems.routes.js";

dotenv.config()

const app = new express()

app.use(express.json());
app.use(cookieParser());

app.get("/", (req,res)=>{
    res.send("Hello Guys welcome to leetlab 🐦‍🔥")
})

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/problems", problemRoutes)
app.use("/api/v1/execute-code", executionRoute)

app.listen(process.env.PORT,()=>{
console.log(`Server is running in port ${process.env.PORT} `)
})
