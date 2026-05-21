import request from "supertest";
import app from "../app";
import prisma from "../prisma";

let organizerToken = "";
let attendeeToken = "";
let eventId = 0;

describe("Events API", () => {
  beforeAll(async () => {
    await prisma.event.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["organizer@mail.com", "attendee@mail.com"],
        },
      },
    });

    await request(app).post("/auth/register").send({
      name: "Organizer User",
      email: "organizer@mail.com",
      password: "Organizer123",
    });

    await request(app).post("/auth/register").send({
      name: "Attendee User",
      email: "attendee@mail.com",
      password: "Attendee123",
    });

    await prisma.user.update({
      where: { email: "organizer@mail.com" },
      data: { role: "organizer" },
    });

    const organizerLogin = await request(app).post("/auth/login").send({
      email: "organizer@mail.com",
      password: "Organizer123",
    });

    organizerToken = organizerLogin.body.token;

    const attendeeLogin = await request(app).post("/auth/login").send({
      email: "attendee@mail.com",
      password: "Attendee123",
    });

    attendeeToken = attendeeLogin.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /events", () => {
    it("should allow organizer to create event", async () => {
      const res = await request(app)
        .post("/events")
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({
          title: "Tech Conference 2026",
          description: "A technology conference for developers and startups.",
          location: "Jakarta",
          date: "2026-08-10",
          price: 150000,
          maxAttendees: 100,
          category: "conference",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe("Tech Conference 2026");
      expect(res.body.data.isPublished).toBe(false);

      eventId = res.body.data.id;
    });

    it("should fail without JWT token", async () => {
      const res = await request(app).post("/events").send({
        title: "No Token Event",
        description: "This request should fail because it has no token.",
        location: "Jakarta",
        date: "2026-08-10",
        price: 100000,
        maxAttendees: 50,
        category: "conference",
      });

      expect(res.status).toBe(401);
    });

    it("should fail if role is not organizer", async () => {
      const res = await request(app)
        .post("/events")
        .set("Authorization", `Bearer ${attendeeToken}`)
        .send({
          title: "Attendee Event",
          description: "This request should fail because attendee cannot create event.",
          location: "Jakarta",
          date: "2026-08-10",
          price: 100000,
          maxAttendees: 50,
          category: "conference",
        });

      expect(res.status).toBe(403);
    });

    it("should fail if date is in the past", async () => {
      const res = await request(app)
        .post("/events")
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({
          title: "Past Event",
          description: "This request should fail because the date is in the past.",
          location: "Jakarta",
          date: "2020-01-01",
          price: 100000,
          maxAttendees: 50,
          category: "conference",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /events", () => {
    it("should return published events array", async () => {
      await request(app)
        .patch(`/events/${eventId}/publish`)
        .set("Authorization", `Bearer ${organizerToken}`);

      const res = await request(app).get("/events");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /events/:id", () => {
    it("should return event detail", async () => {
      const res = await request(app).get(`/events/${eventId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(eventId);
    });

    it("should fail if event not found", async () => {
      const res = await request(app).get("/events/99999");

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /events/:id", () => {
    it("should allow organizer to update own event", async () => {
      const res = await request(app)
        .put(`/events/${eventId}`)
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({
          title: "Updated Tech Conference",
          description: "This event has been updated by the organizer.",
          location: "Bandung",
          date: "2026-09-10",
          price: 200000,
          maxAttendees: 150,
          category: "workshop",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated Tech Conference");
    });

    it("should fail without JWT token", async () => {
      const res = await request(app).put(`/events/${eventId}`).send({
        title: "Updated Without Token",
        description: "This request should fail because it has no token.",
        location: "Bandung",
        date: "2026-09-10",
        price: 200000,
        maxAttendees: 150,
        category: "workshop",
      });

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /events/:id/publish", () => {
    it("should allow organizer to publish own event", async () => {
      const res = await request(app)
        .patch(`/events/${eventId}/publish`)
        .set("Authorization", `Bearer ${organizerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(true);
    });

    it("should fail without JWT token", async () => {
      const res = await request(app).patch(`/events/${eventId}/publish`);

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /events/:id", () => {
    it("should fail if event not found", async () => {
      const res = await request(app)
        .delete("/events/99999")
        .set("Authorization", `Bearer ${organizerToken}`);

      expect(res.status).toBe(404);
    });

    it("should allow organizer to delete own event", async () => {
      const res = await request(app)
        .delete(`/events/${eventId}`)
        .set("Authorization", `Bearer ${organizerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Event deleted successfully");
    });
  });
});