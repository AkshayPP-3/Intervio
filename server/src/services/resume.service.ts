import { prisma } from "../config/prisma.js";
import appError from "../utils/appError.js";

const createResume = async (
    userId: string,
    data: {
        fileName: string;
        fileUrl?: string;
    },
) => {
    const resume = await prisma.resume.create({
        data: {
            userId,
            ...data,
        },
    });

    return resume;
};
