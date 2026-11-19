import { ZodType } from "zod";
const validate = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return next(result.error);
        }
        req.body = result.data;
        next();
    };
};
export default validate;
//# sourceMappingURL=validate.middleware.js.map