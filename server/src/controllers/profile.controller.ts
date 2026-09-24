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

        const profile = await profileServices.createProfile(
            userId,
            req.body,
        );
        return res.status(201).json({
            success: true,
            message: "Profile created successfully",
            data: profile,
        })
    }catch(error){
        next(error);
    }
}
const getProfile = async(req: Request, res: Response, next: NextFunction)=>{
    try{
        const userId = req.body?.id;
        if(!userId){
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            })
        }
        const profile = await profileServices.getProfileByUserId(userId);
        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: profile,
        })
    }catch(error){
        next(error);
    }
}
const updateProfile = async(req: Request, res: Response, next: NextFunction)=>{
    try{
        const userId = req.body?.id;
        if(!userId){
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            })
        }
        const profile = await profileServices.updateProfile(
            userId,
            req.body,
        )
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile,
        })
    }catch(error){
        next(error);
    }
}
const deleteProfile = async(req: Request,res: Response, next: NextFunction)=>{
    try{
        const userId = req.body?.id;
        if(!userId){
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            })
        }
        await profileServices.deleteProfile(userId);
        return res.status(200).json({
            success: true,
            message: "Profile deleted successfully",
            data: profile,
        })
    }catch(error){
        next(error);
    }
}

export default {createProfile, getProfile, updateProfile, deleteProfile};