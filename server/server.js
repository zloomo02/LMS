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

await connectDB() 


app.use(cors())

// JSON
app.use(express.json());

// Clerk
app.use(clerkMiddleware());



// ✅ Middleware to ensure init runs once per cold start
app.use(async (req, res, next) => {
  try {
    await init();
    next();
  } catch (err) {
    console.error("Init failed:", err);
    res.status(500).json({ error: "Initialization failed" });
  }
});

// Routes
app.get("/", (req, res) => res.send("API Working"));

app.post("/clerk", clerkWebhooks);
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);

// Stripe (raw body only)
app.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);


const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
  console.log(`Server is running on port ${PORT}`)
})


 