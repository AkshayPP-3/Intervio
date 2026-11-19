import jwt from "jsonwebtoken";
import appError from "../utils/appError.js";
import { env } from "../config/env.js";
const authMiddleware = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next(new appError("Authentication Required", 401));
        }
        if (!authHeader.startsWith("Bearer ")) {
            return next(new appError("Invalid Authorization format", 401));
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return next(new appError("Authentication token is missing", 401));
        }
        const decoded = jwt.verify(token, env.JWT_SECRET);
        if (!decoded.userId) {
            return next(new appError("Invalid authentication token", 401));
        }
        req.user = {
            userId: decoded.userId,
        };
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new appError("Authentication token expired", 401));
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new appError("Invalid authentication token", 401));
        }
        return next(error);
    }
};
export default authMiddleware;
//# sourceMappingURL=auth.middleware.js.map