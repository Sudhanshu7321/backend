import bcrypt from "bcryptjs";
import { db } from "../libs/db.js"
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";



async function testDbConnection() {
    try {
        await db.$connect();
        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
    } finally {
        await db.$disconnect();
    }
}

testDbConnection();


export const register = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const existingUser = await db.user.findUnique({
            where: {
                email
            }
        })

        if (existingUser) {
            return res.status(400).json({
                err: "User already exist "
            })
        }

        const hasPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data: {
                email: email,
                password: hasPassword,
                name: name,
                role: UserRole.USER,
                updatedAt: new Date()
            }
        })

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "7d" })

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days * milisec * sec * min * hr * day
        })

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                image: newUser.image
            }
        })

    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            return res.status(404).json({
                error: "User not found!"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid credentials"
            })
        }

        const token = jwt.sign({id:user.id}, process.env.JWT_SECRET,{
            expiresIn:"7d"
        })

        res.cookie('jwt', token, {
            httpOnly:true,
            sameSite:"strict",
            secure: process.env.NODE_ENV !== "developmetn",
            maxAge: 1000 * 60 * 60 * 24 * 7
        })

        res.status(201).json({
            message: "User login successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image
            }
        })

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "developmetn",
        })

        res.status(201).json({
            success: true,
            message: "User logout Successfuly ✅"
        })
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
 }

export const check = async (req, res) => { 

   try {
       return res.status(200).json({
           success: true,
           message: "user Auth successfully ✅",
           user: req.user
       })
   } catch (error) {
    console.log(error)
    return res.status(401).json({
        message: "Error checking user",
    })
   }
}