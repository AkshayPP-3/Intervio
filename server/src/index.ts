import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(morgan("dev"));
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});