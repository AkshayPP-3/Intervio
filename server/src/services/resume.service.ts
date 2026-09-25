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
const getResumesByUserId = async (userId: string) => {
    const resumes = await prisma.resume.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return resumes;
};

const getResumeById = async (
    userId: string,
    resumeId: string,
) => {
    const resume = await prisma.resume.findFirst({
        where: {
            id: resumeId,
            userId,
        },
    });

    if (!resume) {
        throw new appError("Resume not found", 404);
    }

    return resume;
};
const updateResume = async (
    userId: string,
    resumeId: string,
    data: {
        fileName?: string;
        fileUrl?: string;
    },
) => {
    const existingResume = await prisma.resume.findFirst({
        where: {
            id: resumeId,
            userId,
        },
    });

    if (!existingResume) {
        throw new appError("Resume not found", 404);
    }

    const resume = await prisma.resume.update({
        where: {
            id: resumeId,
        },
        data,
    });

    return resume;
};
const deleteResume = async (
    userId: string,
    resumeId: string,
) => {
    const existingResume = await prisma.resume.findFirst({
        where: {
            id: resumeId,
            userId,
        },
    });

    if (!existingResume) {
        throw new appError("Resume not found", 404);
    }

    await prisma.resume.delete({
        where: {
            id: resumeId,
        },
    });
};

export default {
    createResume,
    getResumesByUserId,
    getResumeById,
    updateResume,
    deleteResume,
};