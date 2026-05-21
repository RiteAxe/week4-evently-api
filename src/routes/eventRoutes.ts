import express from "express";
import * as eventController from "../controllers/eventController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventDetail);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["organizer"]),
  eventController.createEvent
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["organizer"]),
  eventController.updateOwnEvent
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["organizer"]),
  eventController.deleteOwnEvent
);

router.patch(
  "/:id/publish",
  authMiddleware,
  roleMiddleware(["organizer"]),
  eventController.publishOwnEvent
);

export default router;