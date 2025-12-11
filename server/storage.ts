import { db } from "./db";
import { sql, eq, and, desc, or, SQL } from "drizzle-orm";
import {
  type User,
  type InsertUser,
  type Offer,
  type InsertOffer,
  type Deal,
  type InsertDeal,
  type Report,
  type InsertReport,
  type AdminUser,
  type AuditLog,
  type InsertAuditLog,
  users,
  offers,
  deals,
  reports,
  adminUsers,
  auditLogs,
} from "@shared/schema";

export interface IStorage {
  getUserById(id: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  getOfferById(id: string): Promise<any | undefined>;
  getOffers(filters?: { type?: string; isActive?: boolean; userId?: string }): Promise<any[]>;
  createOffer(userId: string, offer: InsertOffer): Promise<Offer>;
  updateOffer(id: string, userId: string, updates: Partial<InsertOffer>): Promise<Offer | undefined>;
  deleteOffer(id: string, userId: string): Promise<boolean>;
  
  getDealById(id: string): Promise<any | undefined>;
  getDeals(filters?: { buyerId?: string; sellerId?: string; status?: string }): Promise<any[]>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, updates: Partial<InsertDeal>): Promise<Deal | undefined>;
  
  getReports(filters?: { status?: string }): Promise<any[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, updates: { status?: string; reviewedBy?: string; reviewedAt?: Date }): Promise<Report | undefined>;
  
  isAdmin(userId: string): Promise<boolean>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  
  getStats(): Promise<{
    totalUsers: number;
    activeOffers: number;
    totalDeals: number;
    pendingReports: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const normalized = walletAddress.toLowerCase();
    const result = await db.select().from(users).where(eq(users.walletAddress, normalized)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const normalized = { ...user, walletAddress: user.walletAddress.toLowerCase() };
    const result = await db.insert(users).values(normalized).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getOfferById(id: string): Promise<any | undefined> {
    const result = await db
      .select({
        offer: offers,
        user: users,
      })
      .from(offers)
      .leftJoin(users, eq(offers.userId, users.id))
      .where(eq(offers.id, id))
      .limit(1);
    
    if (!result[0]) return undefined;
    
    return {
      ...result[0].offer,
      user: result[0].user,
    };
  }

  async getOffers(filters?: { type?: string; isActive?: boolean; userId?: string }): Promise<any[]> {
    const conditions: SQL[] = [];
    
    if (filters?.type) {
      conditions.push(eq(offers.type, filters.type as any));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(offers.isActive, filters.isActive));
    }
    if (filters?.userId) {
      conditions.push(eq(offers.userId, filters.userId));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const result = await db
      .select({
        offer: offers,
        user: users,
      })
      .from(offers)
      .leftJoin(users, eq(offers.userId, users.id))
      .where(whereClause)
      .orderBy(desc(offers.createdAt));
    
    return result.map(row => ({
      ...row.offer,
      user: row.user,
    }));
  }

  async createOffer(userId: string, offer: InsertOffer): Promise<Offer> {
    const result = await db.insert(offers).values({ ...offer, userId }).returning();
    return result[0];
  }

  async updateOffer(id: string, userId: string, updates: Partial<InsertOffer>): Promise<Offer | undefined> {
    const result = await db
      .update(offers)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(offers.id, id), eq(offers.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteOffer(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(offers)
      .where(and(eq(offers.id, id), eq(offers.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getDealById(id: string): Promise<any | undefined> {
    const result = await db
      .select({
        deal: deals,
        offer: offers,
        buyer: {
          id: users.id,
          walletAddress: users.walletAddress,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          isVerified: users.isVerified,
        },
      })
      .from(deals)
      .leftJoin(offers, eq(deals.offerId, offers.id))
      .leftJoin(users, eq(deals.buyerId, users.id))
      .where(eq(deals.id, id))
      .limit(1);
    
    if (!result[0]) return undefined;
    
    const sellerResult = await db
      .select({
        id: users.id,
        walletAddress: users.walletAddress,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        isVerified: users.isVerified,
      })
      .from(users)
      .where(eq(users.id, result[0].deal.sellerId))
      .limit(1);
    
    return {
      ...result[0].deal,
      offer: result[0].offer,
      buyer: result[0].buyer,
      seller: sellerResult[0],
    };
  }

  async getDeals(filters?: { buyerId?: string; sellerId?: string; status?: string }): Promise<any[]> {
    const conditions: SQL[] = [];
    
    if (filters?.buyerId) {
      conditions.push(eq(deals.buyerId, filters.buyerId));
    }
    if (filters?.sellerId) {
      conditions.push(eq(deals.sellerId, filters.sellerId));
    }
    if (filters?.status) {
      conditions.push(eq(deals.status, filters.status as any));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const result = await db
      .select({
        deal: deals,
        offer: offers,
      })
      .from(deals)
      .leftJoin(offers, eq(deals.offerId, offers.id))
      .where(whereClause)
      .orderBy(desc(deals.createdAt));
    
    return result.map(row => ({
      ...row.deal,
      offer: row.offer,
    }));
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const result = await db.insert(deals).values(deal).returning();
    return result[0];
  }

  async updateDeal(id: string, updates: Partial<InsertDeal>): Promise<Deal | undefined> {
    const result = await db
      .update(deals)
      .set(updates)
      .where(eq(deals.id, id))
      .returning();
    return result[0];
  }

  async getReports(filters?: { status?: string }): Promise<any[]> {
    const conditions: SQL[] = [];
    
    if (filters?.status) {
      conditions.push(eq(reports.status, filters.status as any));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const result = await db
      .select({
        report: reports,
        reporter: {
          id: users.id,
          walletAddress: users.walletAddress,
          displayName: users.displayName,
        },
        offer: offers,
      })
      .from(reports)
      .leftJoin(users, eq(reports.reporterId, users.id))
      .leftJoin(offers, eq(reports.offerId, offers.id))
      .where(whereClause)
      .orderBy(desc(reports.createdAt));
    
    return result.map(row => ({
      ...row.report,
      reporter: row.reporter,
      offer: row.offer,
    }));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const result = await db.insert(reports).values(report).returning();
    return result[0];
  }

  async updateReport(id: string, updates: { status?: string; reviewedBy?: string; reviewedAt?: Date }): Promise<Report | undefined> {
    const result = await db
      .update(reports)
      .set(updates)
      .where(eq(reports.id, id))
      .returning();
    return result[0];
  }

  async isAdmin(userId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.userId, userId))
      .limit(1);
    return result.length > 0;
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const result = await db.insert(auditLogs).values(log).returning();
    return result[0];
  }

  async getStats(): Promise<{
    totalUsers: number;
    activeOffers: number;
    totalDeals: number;
    pendingReports: number;
  }> {
    const [userCount, offerCount, dealCount, reportCount] = await Promise.all([
      db.select({ count: sql<number>`cast(count(*) as int)` }).from(users),
      db.select({ count: sql<number>`cast(count(*) as int)` }).from(offers).where(eq(offers.isActive, true)),
      db.select({ count: sql<number>`cast(count(*) as int)` }).from(deals).where(eq(deals.status, 'completed')),
      db.select({ count: sql<number>`cast(count(*) as int)` }).from(reports).where(eq(reports.status, 'pending')),
    ]);
    
    return {
      totalUsers: userCount[0]?.count || 0,
      activeOffers: offerCount[0]?.count || 0,
      totalDeals: dealCount[0]?.count || 0,
      pendingReports: reportCount[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
