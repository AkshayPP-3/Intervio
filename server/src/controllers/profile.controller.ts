import type { Request, Response, NextFunction } from "express";
import profileServices from "../services/profile.services.js";

const createProfile = async (req: Request, res: Response, next: NextFunction)=>{
    try{
        const userId = req.user?.userId;
        if(!userId){
            return res.status(401).json({
                success: false,
                message: "Authentication required",            })
        }

    
    }
}