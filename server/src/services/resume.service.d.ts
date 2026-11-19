declare const createResume: (userId: string, data: {
    fileName: string;
    fileUrl?: string;
}) => Promise<{
    id: string;
    userId: string;
    fileName: string;
    fileUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const uploadResume: (userId: string, file: Express.Multer.File) => Promise<{
    id: string;
    userId: string;
    fileName: string;
    fileUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const getResumesByUserId: (userId: string) => Promise<{
    id: string;
    userId: string;
    fileName: string;
    fileUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
declare const getResumeById: (userId: string, resumeId: string) => Promise<{
    id: string;
    userId: string;
    fileName: string;
    fileUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const updateResume: (userId: string, resumeId: string, data: {
    fileName?: string;
    fileUrl?: string;
}) => Promise<{
    id: string;
    userId: string;
    fileName: string;
    fileUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const deleteResume: (userId: string, resumeId: string) => Promise<void>;
declare const _default: {
    createResume: typeof createResume;
    uploadResume: typeof uploadResume;
    getResumesByUserId: typeof getResumesByUserId;
    getResumeById: typeof getResumeById;
    updateResume: typeof updateResume;
    deleteResume: typeof deleteResume;
};
export default _default;
//# sourceMappingURL=resume.service.d.ts.map