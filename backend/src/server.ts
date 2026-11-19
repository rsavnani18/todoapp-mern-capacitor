import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });

  // Graceful Shutdown (Render redeploy / container stop par clean exit)
  const shutdown = async (signal: string) => {
    console.info(`\n⚠️ ${signal} received. Closing HTTP server & MongoDB...`);
    server.close(async () => {
      await mongoose.connection.close();
      console.info("✅ Clean shutdown complete.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Rejection:", reason);
    shutdown("unhandledRejection");
  });
};

startServer();
