import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import analyzeHandler from "./api/analyze.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // Mount the serverless function handler to /api/analyze
  app.post("/api/analyze", async (req, res) => {
    try {
      await analyzeHandler(req, res);
    } catch (err) {
      console.error("API handler invocation error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "An unexpected error occurred during analysis." });
      }
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Resume Match" });
  });

  // Serve static assets from public directory
  app.use(express.static(path.join(process.cwd(), "public")));

  // Static / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Resume Match server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
