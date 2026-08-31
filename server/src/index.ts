import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

const app = express();

const PORT = process.env.PORT || 3000;