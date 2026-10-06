import "dotenv/config";

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,

  PORT: Number(process.env.PORT) || 3000,
  
  JWT_SECRET: process.env.JWT_SECRET!,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  SARVAM_API_KEY: process.env.SARVAM_API_KEY!,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
};