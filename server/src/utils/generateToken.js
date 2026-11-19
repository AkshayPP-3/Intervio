import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
const generateToken = (userId) => {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "7d" });
};
export default generateToken;
//# sourceMappingURL=generateToken.js.map