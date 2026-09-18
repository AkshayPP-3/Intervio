import appError from "../utils/appError.js";
import type { Request,Response,NextFunction } from "express";
import { success, ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client.js";

const errorMiddleware = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) =>{
    console.log(err)
    //customized error
    if(err instanceof appError){
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        })
    }
    //zod error (validation and ts mismatch)
    if(err instanceof ZodError){
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.issues,
        })
    }
    //prisma errors (P2002-record already exists,  P2025- record not found)
    if(err instanceof Prisma.PrismaClientKnownRequestError){
        if(err.code==="P2002"){
            return res.status(409).json({
                success: false,
                message: "A record with this value already exists",
            })
        }
        if(err.code==="P2025"){
            return res.status(404).json({
                success:false,
                message: "Requested record was not found",
            })
        }
        return res.status(400).json({
            success: false,
            message: "Database request failed",
        })
    }
    //jsonWebToken error
    if(err instanceof Error && err.name === "JsonWebTokenError"){
        return res.status(401).json({
            success:false,
            message:"Invalid Token",
        })
    }
    if (err instanceof Error && err.name==="TokenExpiredError"){
        return res.status(401).json({
            success: false,
            message: "Token has expired",
        });
    }
    //internal server error
    return res.status(500).json({
        success:false,
        message: "Internal server error",
    })
}

export default errorMiddleware;