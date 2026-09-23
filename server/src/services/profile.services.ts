import { prisma } from "../config/prisma.js";
import appError from "../utils/appError.js";

const createProfile = async (
    userId: string,
    data: {
        bio?: string,
        phone?: string,
        location?:string,
        education?:string,
        skills?: string,
    }
)=>{
    const existingUser = await prisma.profile.findUnique({
        where: {
            userId,
        },
    })
    if(existingUser){
        throw new appError("profile already exists",409);
    }
    const profile = await prisma.profile.create({
        data: {
            userId,
            ...data,
        }
    })
    return profile;
}
const getProfileByUserId = async(userId: string)=>{
    const profile = await prisma.profile.findUnique({
        where: {
            userId,
        },
    })
    if(!profile){
        throw new appError("Profile not found",404);
    }
    return profile;
}
