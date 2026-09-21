import { email, string } from "zod";
import {prisma} from "../../config/prisma";
import appError from "../../utils/appError";
import { throwDeprecation } from "node:process";

const getUserById = async (userId: string)=>{
    const user = await prisma.user.findUnique({
        where:{
            id: userId,
        },
        select:{
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    })
    if(!user){
        throw new appError("User not found",404);
    }
    return user;
}

const updateUser = async(
    userId: string,
    data: {
        name?: string,
        email?: string,
    }
)=>{
    const user = await prisma.user.findUnique({
        where:{
            id: userId
        }
    })
    if(!user){
        throw new appError("User not found",404);
    }
    if(data.email && data.email!==user.email){
        const existingUser = await prisma.user.findUnique({
            where:{
                email: data.email,
            }
        })
        if(existingUser){
            throw new appError("User with this email already exists",409);
        }
    }
    
}