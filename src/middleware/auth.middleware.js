import jwt from "jsonwebtoken"
import { db } from "../libs/db.js"

export const authMiddleware =  async (req, res, next) =>{

    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({
                message: "Unauthorized - No token provided"
            })
        }

        let decoded;

        try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                message: "Unauthorized - Invalid Token"
            })
        }

        const user = await db.user.findUnique({
            where:{
                id: decoded.id
            },
            select:{
                id:true,
                image:true,
                name:true,
                email:true,
                role:true
            }
        });

        if(!user){
            res.status(404).json({
                message: "user not found",
            })
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({
            message:"Something went wrong",
            error: error
        })
    }
}


export const checkAdmin = async (req, res, next) => {
    try {
        const userID = req.user.id
        const user = await db.user.findUnique({
            where: {
                id
            },
            select: {
                role: true
            }
        })

        if (!user || user.role !== "ADMIN") {
            return res.status(3).json({
                message: "Forbidden - you do not have permission  to access  this resource"
            })
        }

        next();
    } catch (error) {
        console.error(error)
        res.status(400).json({
            message: "Somthing went wrong"
        })
    }
}