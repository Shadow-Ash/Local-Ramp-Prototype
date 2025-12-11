import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, numeric, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const offerTypeEnum = pgEnum("offer_type", ["buy", "sell"]);
export const dealStatusEnum = pgEnum("deal_status", ["active", "completed", "cancelled"]);
export const reportStatusEnum = pgEnum("report_status", ["pending", "reviewed", "resolved"]);

export const users = pgTable("users", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// shared/schema.ts - Update offers table

export const offers = pgTable("offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: offerTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 18, scale: 6 }).notNull(),
  minLimit: numeric("min_limit", { precision: 18, scale: 6 }).notNull(),
  maxLimit: numeric("max_limit", { precision: 18, scale: 6 }).notNull(),
  exchangeRate: numeric("exchange_rate", { precision: 18, scale: 6 }), // NEW FIELD
  location: text("location").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  description: text("description"),
  paymentMethods: text("payment_methods").array().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  baseChainTxHash: text("base_chain_tx_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const deals = pgTable("deals", {
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
  cancelledAt: timestamp("cancelled_at"),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  offerId: varchar("offer_id").references(() => offers.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  description: text("description").notNull(),
  status: reportStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: varchar("target_id"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  offers: many(offers),
  dealsAsBuyer: many(deals, { relationName: "buyer" }),
  dealsAsSeller: many(deals, { relationName: "seller" }),
  reports: many(reports, { relationName: "reporter" }),
  reportsAgainst: many(reports, { relationName: "reported" }),
  adminUser: one(adminUsers),
}));

export const offersRelations = relations(offers, ({ one, many }) => ({
  user: one(users, {
    fields: [offers.userId],
    references: [users.id],
  }),
  deals: many(deals),
  reports: many(reports),
}));

export const dealsRelations = relations(deals, ({ one }) => ({
  offer: one(offers, {
    fields: [deals.offerId],
    references: [offers.id],
  }),
  buyer: one(users, {
    fields: [deals.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
  seller: one(users, {
    fields: [deals.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  offer: one(offers, {
    fields: [reports.offerId],
    references: [offers.id],
  }),
  reportedUser: one(users, {
    fields: [reports.userId],
    references: [users.id],
    relationName: "reported",
  }),
  reviewer: one(users, {
    fields: [reports.reviewedBy],
    references: [users.id],
  }),
}));

export const adminUsersRelations = relations(adminUsers, ({ one }) => ({
  user: one(users, {
    fields: [adminUsers.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(users, {
    fields: [auditLogs.adminId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  onChainSince: true,
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  cancelledAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
  reviewedBy: true,
  status: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
