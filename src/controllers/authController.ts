import { Request, Response } from "express";
import * as authService from "../services/authService";
import { loginSchema, registerSchema } from "../validations/authValidation";

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const user = await authService.register(validatedData);

    res.status(201).json({
      message: "Register success",
      data: user,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const token = await authService.login(validatedData);

    res.status(200).json({
      message: "Login success",
      token,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};