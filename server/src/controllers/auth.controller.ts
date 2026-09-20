import type { Request, Response, NextFunction } from "express";
import authService from "../services/auth/auth.service";
import { success } from "zod";

const register = async (req: Request, res: Response, next: NextFunction)=>{
    try{
        const { name, email, password} = req.body;
        const result = authService.registerUser(name,email,password);
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result,
        })
    }catch(error){
        next(error);
    }
}
