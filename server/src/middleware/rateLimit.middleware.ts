import rateLimit from "express-rate-limit";
import appError from "../utils/appError";

const rateLimitMiddleware = rateLimit({
    windowMs: 15* 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    
    handler: (_req,_res,next)=>{
        next(new appError("Too many requests. Please try again",429));
    }
})
export default rateLimitMiddleware;