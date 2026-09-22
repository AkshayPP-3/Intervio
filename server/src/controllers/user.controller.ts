import type { Request, Response, NextFunction } from "express";
import userService from "../services/user/user.service";
import appError from "../utils/appError";
import { success } from "zod";
import { networkInterfaces } from "node:os";

const getMe = async (req: Request, res: Response, next: NextFunction)=>{
    try{
        if(!req.user){
            return next(new appError("Authentication required",401));
        }
        const user = await userService.getUserById( req.user.userId);
        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: {
                user,
            },
        })
    }catch(error){
        next(error);
    }
}
