import bcrypt, { compare } from "bcrypt";
import {prisma} from "../../config/prisma.js";
import appError from "../../utils/appError.js";
import generateToken from "../../utils/generateToken.js";
import { email } from "zod";
import { de } from "zod/v4/locales";

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

const loginUser = async(email:string, password: string)=>{
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })
    if(!user || !user.password){
        throw new appError("Invalid email or password",401);
    }

    const isPasswordValid = await compare(password, user.password);
    if(!isPasswordValid){
        throw new appError("Invalid email or password",401);
    }

    const token = generateToken(user.id);
    return{
        user:{
            id: user.id,
            name: user.name,
            email: user.email,
        },
        token,
    }
}
export default {registerUser, loginUser};