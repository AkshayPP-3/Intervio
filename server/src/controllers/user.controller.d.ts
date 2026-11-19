import type { Request, Response, NextFunction } from "express";
declare const getMe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const updatedMe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const _default: {
    getMe: typeof getMe;
    updatedMe: typeof updatedMe;
};
export default _default;
//# sourceMappingURL=user.controller.d.ts.map