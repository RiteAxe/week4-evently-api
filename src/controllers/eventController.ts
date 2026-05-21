import { Response } from "express";
import * as eventService from "../services/eventService";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  eventParamsSchema,
  eventSchema,
} from "../validations/eventValidation";

export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await eventService.getPublishedEvents();

    res.status(200).json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventDetail = async (req: AuthRequest, res: Response) => {
  try {
    const params = eventParamsSchema.parse(req.params);
    const event = await eventService.getEventById(Number(params.id));

    res.status(200).json(event);
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

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = eventSchema.parse(req.body);

    const event = await eventService.createEvent(
      validatedData,
      req.user!.id
    );

    res.status(201).json({
      message: "Event created successfully",
      data: event,
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

export const updateOwnEvent = async (req: AuthRequest, res: Response) => {
  try {
    const params = eventParamsSchema.parse(req.params);
    const validatedData = eventSchema.parse(req.body);

    const event = await eventService.updateOwnEvent(
      Number(params.id),
      req.user!.id,
      validatedData
    );

    res.status(200).json({
      message: "Event updated successfully",
      data: event,
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

export const deleteOwnEvent = async (req: AuthRequest, res: Response) => {
  try {
    const params = eventParamsSchema.parse(req.params);

    const result = await eventService.deleteOwnEvent(
      Number(params.id),
      req.user!.id
    );

    res.status(200).json(result);
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

export const publishOwnEvent = async (req: AuthRequest, res: Response) => {
  try {
    const params = eventParamsSchema.parse(req.params);

    const event = await eventService.publishOwnEvent(
      Number(params.id),
      req.user!.id
    );

    res.status(200).json({
      message: "Event published successfully",
      data: event,
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