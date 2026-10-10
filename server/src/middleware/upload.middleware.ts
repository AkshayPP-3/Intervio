
import multer from "multer";
import path from "path";
import appError from "../utils/appError.js";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
    "text/plain",
];

const allowedExtensions = [".pdf", ".doc", ".docx"];

const fileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    cb
) => {
    const fileExtension = path
        .extname(file.originalname)
        .toLowerCase();

    const isValidExtension = allowedExtensions.includes(fileExtension);
    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);

    console.log("Filename:", file.originalname);
    console.log("MIME type:", file.mimetype);

    if (isValidExtension && isValidMimeType) {
        cb(null, true);
    } else {
        cb(
            new appError(
                "Only PDF, DOC, and DOCX files are allowed",
                400
            )
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },
});

export default upload;