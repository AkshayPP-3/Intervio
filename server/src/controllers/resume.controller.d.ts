import type { Request, Response, NextFunction } from "express";
declare const createResume: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const uploadResume: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getResumes: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getResume: (req: Request<{
    resumeId: string;
}>, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const updateResume: (req: Request<{
    resumeId: string;
}>, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const deleteResume: (req: Request<{
    resumeId: string;
}>, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const _default: {
    createResume: typeof createResume;
    uploadResume: typeof uploadResume;
    getResumes: typeof getResumes;
    getResume: typeof getResume;
    updateResume: typeof updateResume;
    deleteResume: typeof deleteResume;
};
export default _default;
//# sourceMappingURL=resume.controller.d.ts.map