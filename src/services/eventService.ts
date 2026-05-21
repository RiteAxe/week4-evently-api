import prisma from "../prisma";

type EventData = {
  title: string;
  description: string;
  location: string;
  date: string;
  price: number;
  maxAttendees: number;
  category: string;
};

export const getPublishedEvents = async () => {
  return prisma.event.findMany({
    where: {
      isPublished: true,
    },
  });
};

export const getEventById = async (id: number) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    const error: any = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  return event;
};

export const createEvent = async (data: EventData, organizerId: number) => {
  return prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      date: new Date(data.date),
      price: data.price,
      maxAttendees: data.maxAttendees,
      category: data.category,
      organizerId,
      isPublished: false,
    },
  });
};

export const updateOwnEvent = async (
  id: number,
  organizerId: number,
  data: EventData
) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    const error: any = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  if (event.organizerId !== organizerId) {
    const error: any = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  return prisma.event.update({
    where: { id },
    data: {
      ...data,
      date: new Date(data.date),
    },
  });
};

export const deleteOwnEvent = async (id: number, organizerId: number) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    const error: any = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  if (event.organizerId !== organizerId) {
    const error: any = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  await prisma.event.delete({
    where: { id },
  });

  return { message: "Event deleted successfully" };
};

export const publishOwnEvent = async (id: number, organizerId: number) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    const error: any = new Error("Event not found");
    error.statusCode = 404;
    throw error;
  }

  if (event.organizerId !== organizerId) {
    const error: any = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  return prisma.event.update({
    where: { id },
    data: {
      isPublished: true,
    },
  });
};