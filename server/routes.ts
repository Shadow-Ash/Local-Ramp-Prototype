import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertOfferSchema, insertDealSchema, insertReportSchema, type User } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// server/routes.ts - Update authenticateWallet function

async function authenticateWallet(req: any, res: any, next: any) {
  let walletAddress = req.headers["x-wallet-address"];
  
  // Temporary: Use default wallet if none provided
  if (!walletAddress || typeof walletAddress !== "string") {
    walletAddress = "0x0000000000000000000000000000000000000001"; // Default temporary wallet
    console.log("⚠️  Using temporary default wallet address");
  }
  
  let user = await storage.getUserByWalletAddress(walletAddress);
  
  // Auto-create user if doesn't exist
  if (!user) {
    user = await storage.createUser({
      walletAddress,
      displayName: "Anonymous User",
      bio: null,
      avatarUrl: null,
      location: null,
      phoneNumber: null,
      isVerified: false,
      isSuspended: false,
      showWalletAddress: false, // Hide default wallet
      notificationsEnabled: true,
    });
    console.log("✅ Auto-created user for wallet:", walletAddress);
  }
  
  req.user = user;
  next();
}

async function requireAdmin(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const isAdmin = await storage.isAdmin(req.user.id);
  if (!isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/connect", async (req, res) => {
    try {
      const schema = z.object({
        walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
      });
      
      const { walletAddress } = schema.parse(req.body);
      
      let user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        user = await storage.createUser({
          walletAddress,
          displayName: null,
          bio: null,
          avatarUrl: null,
          location: null,
          phoneNumber: null,
          isVerified: false,
          isSuspended: false,
          showWalletAddress: true,
          notificationsEnabled: true,
        });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  
  app.get("/api/users/me", authenticateWallet, async (req, res) => {
    res.json(req.user);
  });
  
  app.patch("/api/users/me", authenticateWallet, async (req, res) => {
    try {
      const schema = insertUserSchema.partial().omit({ walletAddress: true });
      const updates = schema.parse(req.body);
      
      const updatedUser = await storage.updateUser(req.user!.id, updates);
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  
  app.get("/api/offers", async (req, res) => {
    try {
      const { type, isActive, userId } = req.query;
      
      const filters: any = {};
      if (type) filters.type = type as string;
      if (isActive !== undefined) filters.isActive = isActive === "true";
      if (userId) filters.userId = userId as string;
      
      const offers = await storage.getOffers(filters);
      res.json(offers);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  
  app.get("/api/offers/:id", async (req, res) => {
    try {
      const offer = await storage.getOfferById(req.params.id);
      if (!offer) {
        return res.status(404).json({ error: "Offer not found" });
      }
      res.json(offer);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  
  app.post("/api/offers", authenticateWallet, async (req, res) => {
    try {
      const schema = insertOfferSchema.extend({
        paymentMethods: z.array(z.string()).min(1, "At least one payment method required"),
      });
      
      const offerData = schema.parse(req.body);
      const offer = await storage.createOffer(req.user!.id, offerData);
      res.status(201).json(offer);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  
  app.patch("/api/offers/:id", authenticateWallet, async (req, res) => {
    try {
      const schema = insertOfferSchema.partial();
      const updates = schema.parse(req.body);
      
      const updatedOffer = await storage.updateOffer(req.params.id, req.user!.id, updates);
      if (!updatedOffer) {
        return res.status(404).json({ error: "Offer not found or unauthorized" });
      }
      res.json(updatedOffer);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  
  app.delete("/api/offers/:id", authenticateWallet, async (req, res) => {
    try {
      const deleted = await storage.deleteOffer(req.params.id, req.user!.id);
      if (!deleted) {
        return res.status(404).json({ error: "Offer not found or unauthorized" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  
  app.get("/api/deals", authenticateWallet, async (req, res) => {
    try {
      const { status } = req.query;
      
      const deals = await storage.getDeals({
        buyerId: req.user!.id,
        sellerId: req.user!.id,
        status: status as string | undefined,
      });
      
      const userDeals = deals.filter(
        (deal: any) => deal.buyerId === req.user!.id || deal.sellerId === req.user!.id
      );
      
      res.json(userDeals);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  
  app.get("/api/deals/:id", authenticateWallet, async (req, res) => {
    try {
      const deal = await storage.getDealById(req.params.id);
      if (!deal) {
        return res.status(404).json({ error: "Deal not found" });
      }
      
      if (deal.buyerId !== req.user!.id && deal.sellerId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      res.json(deal);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  
  app.post("/api/deals", authenticateWallet, async (req, res) => {
    try {
      const schema = insertDealSchema;
      const dealData = schema.parse(req.body);
      
      const offer = await storage.getOfferById(dealData.offerId);
      if (!offer) {
        return res.status(404).json({ error: "Offer not found" });
      }
      
      const deal = await storage.createDeal(dealData);
      res.status(201).json(deal);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  
  app.patch("/api/deals/:id", authenticateWallet, async (req, res) => {
    try {
      const schema = z.object({
        status: z.enum(["active", "completed", "cancelled"]).optional(),
        baseChainTxHash: z.string().optional(),
        notes: z.string().optional(),
      });
      
      const updates = schema.parse(req.body);
      
      if (updates.status === "completed") {
        updates.completedAt = new Date();
      } else if (updates.status === "cancelled") {
        updates.cancelledAt = new Date();
      }
      
      const updatedDeal = await storage.updateDeal(req.params.id, updates as any);
      if (!updatedDeal) {
        return res.status(404).json({ error: "Deal not found" });
      }
      res.json(updatedDeal);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  
  app.post("/api/reports", authenticateWallet, async (req, res) => {
    try {
      const schema = insertReportSchema.extend({
        reporterId: z.string(),
      });
      
      const reportData = schema.parse({
        ...req.body,
        reporterId: req.user!.id,
      });
      
      const report = await storage.createReport(reportData);
      res.status(201).json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  
  app.get("/api/admin/stats", authenticateWallet, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  
  app.get("/api/admin/reports", authenticateWallet, requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const reports = await storage.getReports({
        status: status as string | undefined,
      });
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  
  app.patch("/api/admin/reports/:id", authenticateWallet, requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        status: z.enum(["pending", "reviewed", "resolved"]),
      });
      
      const { status } = schema.parse(req.body);
      
      const updatedReport = await storage.updateReport(req.params.id, {
        status,
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
      });
      
      if (!updatedReport) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      await storage.createAuditLog({
        adminId: req.user!.id,
        action: `report_${status}`,
        targetType: "report",
        targetId: req.params.id,
        details: `Report marked as ${status}`,
      });
      
      res.json(updatedReport);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  
  app.patch("/api/admin/users/:id/suspend", authenticateWallet, requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        isSuspended: z.boolean(),
      });
      
      const { isSuspended } = schema.parse(req.body);
      
      const updatedUser = await storage.updateUser(req.params.id, { isSuspended });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      await storage.createAuditLog({
        adminId: req.user!.id,
        action: isSuspended ? "user_suspended" : "user_unsuspended",
        targetType: "user",
        targetId: req.params.id,
        details: `User ${isSuspended ? "suspended" : "unsuspended"}`,
      });
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  
  app.patch("/api/admin/users/:id/verify", authenticateWallet, requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        isVerified: z.boolean(),
      });
      
      const { isVerified } = schema.parse(req.body);
      
      const updatedUser = await storage.updateUser(req.params.id, { isVerified });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      await storage.createAuditLog({
        adminId: req.user!.id,
        action: isVerified ? "user_verified" : "user_unverified",
        targetType: "user",
        targetId: req.params.id,
        details: `User verification ${isVerified ? "granted" : "revoked"}`,
      });
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
