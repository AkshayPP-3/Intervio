import type { Request, Response, NextFunction } from "express";

import { getDashboard } from "../services/dashboard.service.js";

export const getDashboardController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;

    const dashboard = await getDashboard(userId);

    res.status(200).json({
      success: true,
      message: "Dashboard fetched successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};