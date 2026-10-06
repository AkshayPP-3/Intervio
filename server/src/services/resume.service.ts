import { prisma } from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";
import appError from "../utils/appError.js";

const uploadFileToCloudinary = (
    buffer: Buffer,
    fileName: string,
) => {
    return new Promise<{
        secure_url: string;
        public_id: string;
    }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "intervio/resumes",
                resource_type: "raw",
                public_id: fileName,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result) {
                    reject(new Error("Cloudinary upload failed"));
                    return;
                }

                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });
            },
        );

        uploadStream.end(buffer);
    });
};

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

const uploadResume = async (
    userId: string,
    file: Express.Multer.File,
) => {
    const uploadResult = await uploadFileToCloudinary(
        file.buffer,
        file.originalname,
    );

    const resume = await prisma.resume.create({
        data: {
            userId,
            fileName: file.originalname,
            fileUrl: uploadResult.secure_url,
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
    uploadResume,
    getResumesByUserId,
    getResumeById,
    updateResume,
    deleteResume,
};