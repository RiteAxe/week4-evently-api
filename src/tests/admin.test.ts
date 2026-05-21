import request from "supertest";
import app from "../app";
import prisma from "../prisma";

let adminToken = "";
let attendeeToken = "";
let eventId = 0;

describe("Admin API", () => {
  beforeAll(async () => {
    await prisma.event.deleteMany();

    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["admin@evently.com", "adminattendee@mail.com", "adminorganizer@mail.com"],
        },
      },
    });

    await request(app).post("/auth/register").send({
      name: "Admin Attendee",
      email: "adminattendee@mail.com",
      password: "Attendee123",
    });

    await request(app).post("/auth/register").send({
      name: "Admin Organizer",
      email: "adminorganizer@mail.com",
      password: "Organizer123",
    });

    await prisma.user.update({
      where: { email: "adminorganizer@mail.com" },
      data: { role: "organizer" },
    });

    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@evently.com",
        password: await require("bcrypt").hash("Admin123", 10),
        role: "admin",
      },
    });

    const adminLogin = await request(app).post("/auth/login").send({
      email: "admin@evently.com",
      password: "Admin123",
    });

    adminToken = adminLogin.body.token;

    const attendeeLogin = await request(app).post("/auth/login").send({
      email: "adminattendee@mail.com",
      password: "Attendee123",
    });

    attendeeToken = attendeeLogin.body.token;

    const organizerLogin = await request(app).post("/auth/login").send({
      email: "adminorganizer@mail.com",
      password: "Organizer123",
    });

    const organizerToken = organizerLogin.body.token;

    const eventRes = await request(app)
      .post("/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        title: "Admin Test Event",
        description: "This event is created for admin testing purposes.",
        location: "Jakarta",
        date: "2026-10-10",
        price: 100000,
        maxAttendees: 100,
        category: "conference",
      });

    eventId = eventRes.body.data.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /admin/events", () => {
    it("should allow admin to see all events", async () => {
      const res = await request(app)
        .get("/admin/events")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should fail if role is not admin", async () => {
      const res = await request(app)
        .get("/admin/events")
        .set("Authorization", `Bearer ${attendeeToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /admin/users", () => {
    it("should allow admin to see all users", async () => {
      const res = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].password).toBeUndefined();
    });

    it("should fail if role is not admin", async () => {
      const res = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${attendeeToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /admin/users/role", () => {
    it("should allow admin to assign organizer role", async () => {
      const res = await request(app)
        .patch("/admin/users/role")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "adminattendee@mail.com",
          role: "organizer",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe("organizer");
    });

    it("should fail if user email not found", async () => {
      const res = await request(app)
        .patch("/admin/users/role")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "notfound@mail.com",
          role: "organizer",
        });

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /admin/events/:id", () => {
    it("should allow admin to update any event", async () => {
      const res = await request(app)
        .put(`/admin/events/${eventId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Admin Updated Event",
          description: "This event has been updated by admin for testing.",
          location: "Bandung",
          date: "2026-11-10",
          price: 200000,
          maxAttendees: 150,
          category: "workshop",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Admin Updated Event");
    });
  });

  describe("DELETE /admin/events/:id", () => {
    it("should fail if role is not admin", async () => {
      const res = await request(app)
        .delete(`/admin/events/${eventId}`)
        .set("Authorization", `Bearer ${attendeeToken}`);

      expect(res.status).toBe(403);
    });

    it("should allow admin to delete any event", async () => {
      const res = await request(app)
        .delete(`/admin/events/${eventId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Event deleted successfully");
    });
  });
});