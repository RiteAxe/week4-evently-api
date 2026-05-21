import express from "express";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import eventRoutes from "./routes/eventRoutes";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Evently API is running" });
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/events", eventRoutes);

export default app;