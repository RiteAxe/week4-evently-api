import request from "supertest";
import app from "../app";
import prisma from "../prisma";

describe("Auth API", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["testuser@mail.com"],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /auth/register", () => {
    it("should register user successfully", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          name: "Test User",
          email: "testuser@mail.com",
          password: "Test1234",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe("testuser@mail.com");
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data.role).toBe("attendee");
    });

    it("should fail if email already registered", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          name: "Test User",
          email: "testuser@mail.com",
          password: "Test1234",
        });

      expect(res.status).toBe(409);
    });

    it("should fail if password is weak", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          name: "Bad User",
          email: "baduser@mail.com",
          password: "weak",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    it("should login successfully", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: "testuser@mail.com",
          password: "Test1234",
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("should fail if password is wrong", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: "testuser@mail.com",
          password: "Wrong1234",
        });

      expect(res.status).toBe(401);
    });

    it("should fail if email is not registered", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: "notfound@mail.com",
          password: "Test1234",
        });

      expect(res.status).toBe(401);
    });
  });
});