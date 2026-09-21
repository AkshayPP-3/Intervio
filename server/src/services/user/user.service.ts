import {prisma} from "../../config/prisma";
import appError from "../../utils/appError";

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