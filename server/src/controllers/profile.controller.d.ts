import type { Request, Response, NextFunction } from "express";
declare const createProfile: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getProfile: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const updateProfile: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const deleteProfile: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const _default: {
    createProfile: typeof createProfile;
    getProfile: typeof getProfile;
    updateProfile: typeof updateProfile;
    deleteProfile: typeof deleteProfile;
};
export default _default;
//# sourceMappingURL=profile.controller.d.ts.map