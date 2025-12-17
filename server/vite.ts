import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express, { type Express, type Request, Response } from "express";
import type http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const log = (msg: string, color: "blue" | "yellow" = "blue") => {
  if (color === "blue") {
    console.log(`\x1b[1m\x1b[34m➜  ${msg}\x1b[0m`);
  } else {
    console.log(`\x1b[1m\x1b[33m⚠  ${msg}\x1b[0m`);
  }
};

export async function setupVite(app: Express, server: http.Server) {
  const { createServer } = await import("vite");

  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res) => {
    const url = req.originalUrl;
    const template = fs.readFileSync(
      path.resolve(__dirname, "../client/index.html"),
      "utf-8"
    );
    const page = await vite.transformIndexHtml(url, template);
    res.status(200).set({ "Content-Type": "text/html" }).end(page);
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "../dist/public");
  
  app.use(express.static(distPath));
  
  // SPA fallback - serve index.html for all routes
  app.use("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
