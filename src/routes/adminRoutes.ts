import express from "express";
import {
  assignRole,
  getAllUsers,
  getAllEvents,
  updateAnyEvent,
  deleteAnyEvent,
} from "../controllers/adminController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = express.Router();

router.get(
  "/events",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllEvents
);

router.put(
  "/events/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateAnyEvent
);

router.delete(
  "/events/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteAnyEvent
);

router.get(
  "/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllUsers
);

router.patch(
  "/users/role",
  authMiddleware,
  roleMiddleware(["admin"]),
  assignRole
);

export default router;