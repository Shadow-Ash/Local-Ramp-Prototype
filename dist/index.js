var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminUsers: () => adminUsers,
  adminUsersRelations: () => adminUsersRelations,
  auditLogs: () => auditLogs,
  auditLogsRelations: () => auditLogsRelations,
  dealStatusEnum: () => dealStatusEnum,
  deals: () => deals,
  dealsRelations: () => dealsRelations,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertDealSchema: () => insertDealSchema,
  insertOfferSchema: () => insertOfferSchema,
  insertReportSchema: () => insertReportSchema,
  insertUserSchema: () => insertUserSchema,
  offerTypeEnum: () => offerTypeEnum,
  offers: () => offers,
  offersRelations: () => offersRelations,
  reportStatusEnum: () => reportStatusEnum,
  reports: () => reports,
  reportsRelations: () => reportsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, numeric, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var offerTypeEnum = pgEnum("offer_type", ["buy", "sell"]);
var dealStatusEnum = pgEnum("deal_status", ["active", "completed", "cancelled"]);
var reportStatusEnum = pgEnum("report_status", ["pending", "reviewed", "resolved"]);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  location: text("location"),
  phoneNumber: text("phone_number"),
  isVerified: boolean("is_verified").default(false).notNull(),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  showWalletAddress: boolean("show_wallet_address").default(true).notNull(),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
  onChainSince: timestamp("on_chain_since").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var offers = pgTable("offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: offerTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 18, scale: 6 }).notNull(),
  minLimit: numeric("min_limit", { precision: 18, scale: 6 }).notNull(),
  maxLimit: numeric("max_limit", { precision: 18, scale: 6 }).notNull(),
  exchangeRate: numeric("exchange_rate", { precision: 18, scale: 6 }),
  // NEW FIELD
  location: text("location").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  description: text("description"),
  paymentMethods: text("payment_methods").array().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  baseChainTxHash: text("base_chain_tx_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => offers.id, { onDelete: "cascade" }),
  buyerId: varchar("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sellerId: varchar("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 18, scale: 6 }).notNull(),
  status: dealStatusEnum("status").notNull().default("active"),
  baseChainTxHash: text("base_chain_tx_hash"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at")
});
var reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  offerId: varchar("offer_id").references(() => offers.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  description: text("description").notNull(),
  status: reportStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id)
});
var adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: varchar("target_id"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var usersRelations = relations(users, ({ many, one }) => ({
  offers: many(offers),
  dealsAsBuyer: many(deals, { relationName: "buyer" }),
  dealsAsSeller: many(deals, { relationName: "seller" }),
  reports: many(reports, { relationName: "reporter" }),
  reportsAgainst: many(reports, { relationName: "reported" }),
  adminUser: one(adminUsers)
}));
var offersRelations = relations(offers, ({ one, many }) => ({
  user: one(users, {
    fields: [offers.userId],
    references: [users.id]
  }),
  deals: many(deals),
  reports: many(reports)
}));
var dealsRelations = relations(deals, ({ one }) => ({
  offer: one(offers, {
    fields: [deals.offerId],
    references: [offers.id]
  }),
  buyer: one(users, {
    fields: [deals.buyerId],
    references: [users.id],
    relationName: "buyer"
  }),
  seller: one(users, {
    fields: [deals.sellerId],
    references: [users.id],
    relationName: "seller"
  })
}));
var reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
    relationName: "reporter"
  }),
  offer: one(offers, {
    fields: [reports.offerId],
    references: [offers.id]
  }),
  reportedUser: one(users, {
    fields: [reports.userId],
    references: [users.id],
    relationName: "reported"
  }),
  reviewer: one(users, {
    fields: [reports.reviewedBy],
    references: [users.id]
  })
}));
var adminUsersRelations = relations(adminUsers, ({ one }) => ({
  user: one(users, {
    fields: [adminUsers.userId],
    references: [users.id]
  })
}));
var auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(users, {
    fields: [auditLogs.adminId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  onChainSince: true
});
var insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true
});
var insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  cancelledAt: true
});
var insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
  reviewedBy: true,
  status: true
});
var insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { sql as sql2, eq, and, desc } from "drizzle-orm";
var DatabaseStorage = class {
  async getUserById(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByWalletAddress(walletAddress) {
    const normalized = walletAddress.toLowerCase();
    const result = await db.select().from(users).where(eq(users.walletAddress, normalized)).limit(1);
    return result[0];
  }
  async createUser(user) {
    const normalized = { ...user, walletAddress: user.walletAddress.toLowerCase() };
    const result = await db.insert(users).values(normalized).returning();
    return result[0];
  }
  async updateUser(id, updates) {
    const result = await db.update(users).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async getOfferById(id) {
    const result = await db.select({
      offer: offers,
      user: users
    }).from(offers).leftJoin(users, eq(offers.userId, users.id)).where(eq(offers.id, id)).limit(1);
    if (!result[0]) return void 0;
    return {
      ...result[0].offer,
      user: result[0].user
    };
  }
  async getOffers(filters) {
    const conditions = [];
    if (filters?.type) {
      conditions.push(eq(offers.type, filters.type));
    }
    if (filters?.isActive !== void 0) {
      conditions.push(eq(offers.isActive, filters.isActive));
    }
    if (filters?.userId) {
      conditions.push(eq(offers.userId, filters.userId));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
    const result = await db.select({
      offer: offers,
      user: users
    }).from(offers).leftJoin(users, eq(offers.userId, users.id)).where(whereClause).orderBy(desc(offers.createdAt));
    return result.map((row) => ({
      ...row.offer,
      user: row.user
    }));
  }
  async createOffer(userId, offer) {
    const result = await db.insert(offers).values({ ...offer, userId }).returning();
    return result[0];
  }
  async updateOffer(id, userId, updates) {
    const result = await db.update(offers).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(offers.id, id), eq(offers.userId, userId))).returning();
    return result[0];
  }
  async deleteOffer(id, userId) {
    const result = await db.delete(offers).where(and(eq(offers.id, id), eq(offers.userId, userId))).returning();
    return result.length > 0;
  }
  async getDealById(id) {
    const result = await db.select({
      deal: deals,
      offer: offers,
      buyer: {
        id: users.id,
        walletAddress: users.walletAddress,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        isVerified: users.isVerified
      }
    }).from(deals).leftJoin(offers, eq(deals.offerId, offers.id)).leftJoin(users, eq(deals.buyerId, users.id)).where(eq(deals.id, id)).limit(1);
    if (!result[0]) return void 0;
    const sellerResult = await db.select({
      id: users.id,
      walletAddress: users.walletAddress,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      isVerified: users.isVerified
    }).from(users).where(eq(users.id, result[0].deal.sellerId)).limit(1);
    return {
      ...result[0].deal,
      offer: result[0].offer,
      buyer: result[0].buyer,
      seller: sellerResult[0]
    };
  }
  async getDeals(filters) {
    const conditions = [];
    if (filters?.buyerId) {
      conditions.push(eq(deals.buyerId, filters.buyerId));
    }
    if (filters?.sellerId) {
      conditions.push(eq(deals.sellerId, filters.sellerId));
    }
    if (filters?.status) {
      conditions.push(eq(deals.status, filters.status));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
    const result = await db.select({
      deal: deals,
      offer: offers
    }).from(deals).leftJoin(offers, eq(deals.offerId, offers.id)).where(whereClause).orderBy(desc(deals.createdAt));
    return result.map((row) => ({
      ...row.deal,
      offer: row.offer
    }));
  }
  async createDeal(deal) {
    const result = await db.insert(deals).values(deal).returning();
    return result[0];
  }
  async updateDeal(id, updates) {
    const result = await db.update(deals).set(updates).where(eq(deals.id, id)).returning();
    return result[0];
  }
  async getReports(filters) {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(reports.status, filters.status));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
    const result = await db.select({
      report: reports,
      reporter: {
        id: users.id,
        walletAddress: users.walletAddress,
        displayName: users.displayName
      },
      offer: offers
    }).from(reports).leftJoin(users, eq(reports.reporterId, users.id)).leftJoin(offers, eq(reports.offerId, offers.id)).where(whereClause).orderBy(desc(reports.createdAt));
    return result.map((row) => ({
      ...row.report,
      reporter: row.reporter,
      offer: row.offer
    }));
  }
  async createReport(report) {
    const result = await db.insert(reports).values(report).returning();
    return result[0];
  }
  async updateReport(id, updates) {
    const result = await db.update(reports).set(updates).where(eq(reports.id, id)).returning();
    return result[0];
  }
  async isAdmin(userId) {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.userId, userId)).limit(1);
    return result.length > 0;
  }
  async createAuditLog(log2) {
    const result = await db.insert(auditLogs).values(log2).returning();
    return result[0];
  }
  async getStats() {
    const [userCount, offerCount, dealCount, reportCount] = await Promise.all([
      db.select({ count: sql2`cast(count(*) as int)` }).from(users),
      db.select({ count: sql2`cast(count(*) as int)` }).from(offers).where(eq(offers.isActive, true)),
      db.select({ count: sql2`cast(count(*) as int)` }).from(deals).where(eq(deals.status, "completed")),
      db.select({ count: sql2`cast(count(*) as int)` }).from(reports).where(eq(reports.status, "pending"))
    ]);
    return {
      totalUsers: userCount[0]?.count || 0,
      activeOffers: offerCount[0]?.count || 0,
      totalDeals: dealCount[0]?.count || 0,
      pendingReports: reportCount[0]?.count || 0
    };
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
async function authenticateWallet(req, res, next) {
  let walletAddress = req.headers["x-wallet-address"];
  if (!walletAddress || typeof walletAddress !== "string") {
    walletAddress = "0x0000000000000000000000000000000000000001";
    console.log("\u26A0\uFE0F  Using temporary default wallet address");
  }
  let user = await storage.getUserByWalletAddress(walletAddress);
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
      showWalletAddress: false,
      // Hide default wallet
      notificationsEnabled: true
    });
    console.log("\u2705 Auto-created user for wallet:", walletAddress);
  }
  req.user = user;
  next();
}
async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const isAdmin = await storage.isAdmin(req.user.id);
  if (!isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
async function registerRoutes(app2) {
  app2.post("/api/auth/connect", async (req, res) => {
    try {
      const schema = z.object({
        walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address")
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
          notificationsEnabled: true
        });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  app2.get("/api/users/me", authenticateWallet, async (req, res) => {
    res.json(req.user);
  });
  app2.patch("/api/users/me", authenticateWallet, async (req, res) => {
    try {
      const schema = insertUserSchema.partial().omit({ walletAddress: true });
      const updates = schema.parse(req.body);
      const updatedUser = await storage.updateUser(req.user.id, updates);
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  app2.get("/api/offers", async (req, res) => {
    try {
      const { type, isActive, userId } = req.query;
      const filters = {};
      if (type) filters.type = type;
      if (isActive !== void 0) filters.isActive = isActive === "true";
      if (userId) filters.userId = userId;
      const offers2 = await storage.getOffers(filters);
      res.json(offers2);
    } catch (error) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  app2.get("/api/offers/:id", async (req, res) => {
    try {
      const offer = await storage.getOfferById(req.params.id);
      if (!offer) {
        return res.status(404).json({ error: "Offer not found" });
      }
      res.json(offer);
    } catch (error) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  app2.post("/api/offers", authenticateWallet, async (req, res) => {
    try {
      const schema = insertOfferSchema.extend({
        paymentMethods: z.array(z.string()).min(1, "At least one payment method required")
      });
      const offerData = schema.parse(req.body);
      const offer = await storage.createOffer(req.user.id, offerData);
      res.status(201).json(offer);
    } catch (error) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  app2.patch("/api/offers/:id", authenticateWallet, async (req, res) => {
    try {
      const schema = insertOfferSchema.partial();
      const updates = schema.parse(req.body);
      const updatedOffer = await storage.updateOffer(req.params.id, req.user.id, updates);
      if (!updatedOffer) {
        return res.status(404).json({ error: "Offer not found or unauthorized" });
      }
      res.json(updatedOffer);
    } catch (error) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  app2.delete("/api/offers/:id", authenticateWallet, async (req, res) => {
    try {
      const deleted = await storage.deleteOffer(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ error: "Offer not found or unauthorized" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  app2.get("/api/deals", authenticateWallet, async (req, res) => {
    try {
      const { status } = req.query;
      const deals2 = await storage.getDeals({
        buyerId: req.user.id,
        sellerId: req.user.id,
        status
      });
      const userDeals = deals2.filter(
        (deal) => deal.buyerId === req.user.id || deal.sellerId === req.user.id
      );
      res.json(userDeals);
    } catch (error) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  app2.get("/api/deals/:id", authenticateWallet, async (req, res) => {
    try {
      const deal = await storage.getDealById(req.params.id);
      if (!deal) {
        return res.status(404).json({ error: "Deal not found" });
      }
      if (deal.buyerId !== req.user.id && deal.sellerId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      res.json(deal);
    } catch (error) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  app2.post("/api/deals", authenticateWallet, async (req, res) => {
    try {
      const schema = insertDealSchema;
      const dealData = schema.parse(req.body);
      const offer = await storage.getOfferById(dealData.offerId);
      if (!offer) {
        return res.status(404).json({ error: "Offer not found" });
      }
      const deal = await storage.createDeal(dealData);
      res.status(201).json(deal);
    } catch (error) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  app2.patch("/api/deals/:id", authenticateWallet, async (req, res) => {
    try {
      const schema = z.object({
        status: z.enum(["active", "completed", "cancelled"]).optional(),
        baseChainTxHash: z.string().optional(),
        notes: z.string().optional()
      });
      const updates = schema.parse(req.body);
      if (updates.status === "completed") {
        updates.completedAt = /* @__PURE__ */ new Date();
      } else if (updates.status === "cancelled") {
        updates.cancelledAt = /* @__PURE__ */ new Date();
      }
      const updatedDeal = await storage.updateDeal(req.params.id, updates);
      if (!updatedDeal) {
        return res.status(404).json({ error: "Deal not found" });
      }
      res.json(updatedDeal);
    } catch (error) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  app2.post("/api/reports", authenticateWallet, async (req, res) => {
    try {
      const schema = insertReportSchema.extend({
        reporterId: z.string()
      });
      const reportData = schema.parse({
        ...req.body,
        reporterId: req.user.id
      });
      const report = await storage.createReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  app2.get("/api/admin/stats", authenticateWallet, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  app2.get("/api/admin/reports", authenticateWallet, requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const reports2 = await storage.getReports({
        status
      });
      res.json(reports2);
    } catch (error) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  });
  app2.patch("/api/admin/reports/:id", authenticateWallet, requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        status: z.enum(["pending", "reviewed", "resolved"])
      });
      const { status } = schema.parse(req.body);
      const updatedReport = await storage.updateReport(req.params.id, {
        status,
        reviewedBy: req.user.id,
        reviewedAt: /* @__PURE__ */ new Date()
      });
      if (!updatedReport) {
        return res.status(404).json({ error: "Report not found" });
      }
      await storage.createAuditLog({
        adminId: req.user.id,
        action: `report_${status}`,
        targetType: "report",
        targetId: req.params.id,
        details: `Report marked as ${status}`
      });
      res.json(updatedReport);
    } catch (error) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  app2.patch("/api/admin/users/:id/suspend", authenticateWallet, requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        isSuspended: z.boolean()
      });
      const { isSuspended } = schema.parse(req.body);
      const updatedUser = await storage.updateUser(req.params.id, { isSuspended });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.createAuditLog({
        adminId: req.user.id,
        action: isSuspended ? "user_suspended" : "user_unsuspended",
        targetType: "user",
        targetId: req.params.id,
        details: `User ${isSuspended ? "suspended" : "unsuspended"}`
      });
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  app2.patch("/api/admin/users/:id/verify", authenticateWallet, requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        isVerified: z.boolean()
      });
      const { isVerified } = schema.parse(req.body);
      const updatedUser = await storage.updateUser(req.params.id, { isVerified });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.createAuditLog({
        adminId: req.user.id,
        action: isVerified ? "user_verified" : "user_unverified",
        targetType: "user",
        targetId: req.params.id,
        details: `User verification ${isVerified ? "granted" : "revoked"}`
      });
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
