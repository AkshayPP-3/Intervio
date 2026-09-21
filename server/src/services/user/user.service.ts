import { prisma } from "../../config/prisma.js";
import AppError from "../../utils/appError.js";

const getUserById = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user;
};

const updateUser = async (
    userId: string,
    data: {
        name?: string;
        email?: string;
    }
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const updateData: {
        name?: string;
        email?: string;
    } = {};

    if (data.name !== undefined) {
        updateData.name = data.name;
    }

    if (data.email !== undefined) {
        updateData.email = data.email;
    }

    if (data.email && data.email !== user.email) {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });

        if (existingUser) {
            throw new AppError(
                "User with this email already exists",
                409
            );
        }
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return updatedUser;
};

export default {
    getUserById,
    updateUser,
};