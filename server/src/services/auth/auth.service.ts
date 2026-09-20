import bcrypt from "bcrypt";
import {prisma} from "../../config/prisma.js";
import appError from "../../utils/appError.js";
import generateToken from "../../utils/generateToken.js";
import { use } from "react";

const registerUser = async(name: string, email: string, password: string)=>{
    const existingUser = await prisma.user.findUnique({
        where:{
            email,
        }
    })
    if(existingUser){
        throw new appError("User with this email Already exists",409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data:{
            name,
            email,
            password: hashedPassword
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    })
    const token = generateToken(user.id);
    return {user, token};
}

