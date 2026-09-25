import type { Request, Response, NextFunction } from "express";
import resumeServices from "../services/resume.service.js";

const createResume = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const resume = await resumeServices.createResume(
            userId,
            req.body,
        );

        return res.status(201).json({
            success: true,
            message: "Resume created successfully",
            data: resume,
        });
    } catch (error) {
        next(error);
    }
};

const getResumes = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const resumes = await resumeServices.getResumesByUserId(userId);

        return res.status(200).json({
            success: true,
            message: "Resumes fetched successfully",
            data: resumes,
        });
    } catch (error) {
        next(error);
    }
};

const getResume = async (
    req: Request<{ resumeId: string }>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user?.userId;
        const { resumeId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const resume = await resumeServices.getResumeById(
            userId,
            resumeId,
        );

        return res.status(200).json({
            success: true,
            message: "Resume fetched successfully",
            data: resume,
        });
    } catch (error) {
        next(error);
    }
};

const updateResume = async (
    req: Request<{ resumeId: string }>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user?.userId;
        const { resumeId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const resume = await resumeServices.updateResume(
            userId,
            resumeId,
            req.body,
        );

        return res.status(200).json({
            success: true,
            message: "Resume updated successfully",
            data: resume,
        });
    } catch (error) {
        next(error);
    }
};

const deleteResume = async (
    req: Request<{ resumeId: string }>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user?.userId;
        const { resumeId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        await resumeServices.deleteResume(
            userId,
            resumeId,
        );

        return res.status(200).json({
            success: true,
            message: "Resume deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createResume,
    getResumes,
    getResume,
    updateResume,
    deleteResume,
};