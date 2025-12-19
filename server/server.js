import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks, stripeWebhooks } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/cloudinary.js";
import courseRouter from "./routes/courseRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

// ✅ Allowed frontend
const allowedOrigin = "https://lms-fawn-pi.vercel.app";

// ✅ CORS FIRST
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ✅ Handle preflight explicitly
app.options("*", (req, res) => {
  res.sendStatus(200);
});


// ✅ JSON middleware (except Stripe)
app.use(express.json());

// ✅ Clerk after CORS
app.use(clerkMiddleware());

// Connect DBs
await connectDB();
await connectCloudinary();

// Routes
app.get("/", (req, res) => {
  res.send("API Working");
});

app.post("/clerk", clerkWebhooks);

app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);

// ⚠️ Stripe MUST use raw body
app.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

  
export default app;

