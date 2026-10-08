import multer from "multer";
import path from "path";
import appError from "../utils/appError.js";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    cb
) => {
    const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",
    ];

    const allowedExtensions = [
        ".pdf",
        ".doc",
        ".docx",
    ];

    const fileExtension = path
        .extname(file.originalname)
        .toLowerCase();

    const isValidMimeType = allowedMimeTypes.includes(
        file.mimetype
    );

    const isValidExtension = allowedExtensions.includes(
        fileExtension
    );

    if (isValidMimeType && isValidExtension) {
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