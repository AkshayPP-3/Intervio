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
const login = async(req: Request, res: Response, next: NextFunction)=>{
    try{
        const {email , password} = req.body;
        const result = authService.loginUer(email, password);
        return res.status(200).json({
            success: true,
            message: "Login successfull",
            data: result,
        })
    }catch(error){
        next(error);
    }
 }
 export default {register,login};