import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"

import errorMiddleware from "./middleware/error.middleware.js"

import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import profileRouter from "./routes/profile.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));

app.use("/api/auth",authRouter);
app.use("/api/users",userRouter);
app.use("/api/profile",profileRouter);

app.get("/",(_req,res)=>{
    res.json({
        success: true,
        message: "intervio api is running",
    });
});

app.use(errorMiddleware);

export default app;