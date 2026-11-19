import type { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
declare const validate: (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => void;
export default validate;
//# sourceMappingURL=validate.middleware.d.ts.map