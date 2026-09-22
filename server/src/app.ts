import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"

import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));

app.use("/api/auth",authRouter);
app.use("/api/users",userRouter);

app.get("/",(_req,res)=>{
    res.json({
        success: true,
        message: "intervio api is running",
    });
});

export default app;