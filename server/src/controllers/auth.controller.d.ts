import type { Request, Response, NextFunction } from "express";
declare const register: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const login: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const _default: {
    register: typeof register;
    login: typeof login;
};
export default _default;
//# sourceMappingURL=auth.controller.d.ts.map