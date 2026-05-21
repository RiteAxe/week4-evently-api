import { Request, Response } from "express";
import prisma from "../prisma";
import { eventParamsSchema, eventSchema } from "../validations/eventValidation";

export const assignRole = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;

    if (role !== "organizer") {
      return res.status(400).json({
        message: "Role can only be changed to organizer",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role },
    });

    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      message: "Role updated successfully",
      data: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany();

    res.status(200).json(events);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateAnyEvent = async (req: Request, res: Response) => {
  try {
    const params = eventParamsSchema.parse(req.params);
    const validatedData = eventSchema.parse(req.body);

    const event = await prisma.event.findUnique({
      where: { id: Number(params.id) },
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: Number(params.id) },
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
      },
    });

    res.status(200).json({
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteAnyEvent = async (req: Request, res: Response) => {
  try {
    const params = eventParamsSchema.parse(req.params);

    const event = await prisma.event.findUnique({
      where: { id: Number(params.id) },
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    await prisma.event.delete({
      where: { id: Number(params.id) },
    });

    res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};