import userService from "../services/user.service";
import appError from "../utils/appError";
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new appError("Authentication required", 401));
        }
        const user = await userService.getUserById(req.user.userId);
        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: {
                user,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
const updatedMe = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new appError("Authentication required", 401));
        }
        const user = await userService.updateUser(req.user.userId, req.body);
        res.status(200).json({
            success: true,
            message: "user updated successfully",
            data: {
                user,
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export default { getMe, updatedMe };
//# sourceMappingURL=user.controller.js.map