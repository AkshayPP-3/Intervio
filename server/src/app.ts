import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));

app.get("/",(_req,res)=>{
    res.json({
        success: true,
        message: "intervio api is running",
    });
});

export default app;