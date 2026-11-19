import authService from "../services/auth.service.js";
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const result = await authService.registerUser(name, email, password);
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        return res.status(200).json({
            success: true,
            message: "Login successfull",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
export default { register, login };
//# sourceMappingURL=auth.controller.js.map