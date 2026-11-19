import { prisma } from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";
import appError from "../utils/appError.js";
const uploadFileToCloudinary = (buffer, fileName) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: "intervio/resumes",
            resource_type: "raw",
            public_id: fileName,
        }, (error, result) => {
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
        });
        uploadStream.end(buffer);
    });
};
const createResume = async (userId, data) => {
    const resume = await prisma.resume.create({
        data: {
            userId,
            ...data,
        },
    });
    return resume;
};
const uploadResume = async (userId, file) => {
    const uploadResult = await uploadFileToCloudinary(file.buffer, file.originalname);
    const resume = await prisma.resume.create({
        data: {
            userId,
            fileName: file.originalname,
            fileUrl: uploadResult.secure_url,
        },
    });
    return resume;
};
const getResumesByUserId = async (userId) => {
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
const getResumeById = async (userId, resumeId) => {
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
const updateResume = async (userId, resumeId, data) => {
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
const deleteResume = async (userId, resumeId) => {
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
//# sourceMappingURL=resume.service.js.map