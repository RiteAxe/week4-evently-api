import { z } from "zod";

const categories = [
  "conference",
  "workshop",
  "seminar",
  "concert",
  "sport",
  "charity",
  "curtural",
] as const;

export const eventSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(20),
  location: z.string().min(1),
  date: z.string().refine((value) => {
    const eventDate = new Date(value);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return eventDate >= today;
  }, "Event date cannot be in the past"),
  price: z.number().min(0),
  maxAttendees: z.number().min(1),
  category: z.enum(categories),
});

export const eventParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number"),
});