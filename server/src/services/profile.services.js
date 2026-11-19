import { prisma } from "../config/prisma.js";
import appError from "../utils/appError.js";
const createProfile = async (userId, data) => {
    const existingUser = await prisma.profile.findUnique({
        where: {
            userId,
        },
    });
    if (existingUser) {
        throw new appError("profile already exists", 409);
    }
    const profile = await prisma.profile.create({
        data: {
            userId,
            ...data,
        }
    });
    return profile;
};
const getProfileByUserId = async (userId) => {
    const profile = await prisma.profile.findUnique({
        where: {
            userId,
        },
    });
    if (!profile) {
        throw new appError("Profile not found", 404);
    }
    return profile;
};
const updateProfile = async (userId, data) => {
    const existingProfile = await prisma.profile.findUnique({
        where: {
            userId,
        }
    });
    if (!existingProfile) {
        throw new appError("Profile not found", 404);
    }
    const profile = await prisma.profile.update({
        where: {
            userId
        },
        data,
    });
    return profile;
};
const deleteProfile = async (userId) => {
    const existingProfile = await prisma.profile.findUnique({
        where: {
            userId,
        }
    });
    if (!existingProfile) {
        throw new appError("Profile not found", 404);
    }
    await prisma.profile.delete({
        where: {
            userId,
        }
    });
};
export default { createProfile, getProfileByUserId, updateProfile, deleteProfile };
//# sourceMappingURL=profile.services.js.map