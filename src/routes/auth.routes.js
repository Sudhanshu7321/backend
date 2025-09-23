import express from 'express'
import { check, login, logout, register } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const authRoutes = express.Router()

// register
authRoutes.post("/register",register) 
// login
authRoutes.post("/login",login)
// logout 
authRoutes.get("/logout",authMiddleware,logout)
// check 
authRoutes.get("/check",authMiddleware, check)

export default  authRoutes;