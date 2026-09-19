import multer from "multer";
import path from "path";
import fs from "fs";
import appError from "../utils/appError";

const uploadDirectory = path.join(process.cwd(),"uploads");
if(!fs.existsSync(uploadDirectory)){
    fs.mkdirSync(uploadDirectory,{recursive:true});
}

const storage = multer.diskStorage({
    destination: (_req,_file,cb)=>{
        cb(null,uploadDirectory)
    },
    filename: (_req,file,cb)=>{
        const uniqueName = `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`;
        cb(null,uniqueName);
    }
})
const fileFilter: multer.Options["fileFilter"]=(req,file,cb)=>{
    const allowedMimeTypes=[
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if(allowedMimeTypes.includes(file.mimetype)){
        cb(null,true);
    }else{
        cb(
            new appError("Only PDF, DOC, and DOCX files are allowed",400)
        )
    }
}
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    }
})
export default upload;