import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  amount: integer("amount").notNull(),
  month: timestamp("month").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  updatedAt: true,
});

export const updateAssetSchema = createInsertSchema(assets).omit({
  id: true,
  updatedAt: true,
});

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type UpdateAsset = z.infer<typeof updateAssetSchema>;
export type Asset = typeof assets.$inferSelect;

export const assetSourceSchema = z.enum([
  "Cryptocurrency",
  "Savings Account Viettel Money",
  "VietcomBank",
  "Tui Than Tai",
  "Cash",
  "Loan",
  "MoMo",
  "VietinBank",
  "ZaloPay",
  "ViettelPay",
  "Stock Investment",
]);

export type AssetSource = z.infer<typeof assetSourceSchema>;

export const ASSET_SOURCE_COLORS: Record<AssetSource, string> = {
  Cryptocurrency: "#6366F1", // Investment Fund
  "Savings Account Viettel Money": "#10B981", // Savings Account
  VietcomBank: "#10B981", // Savings Account
  "Tui Than Tai": "#10B981", // Savings Account
  Cash: "#3B82F6", // Cash
  Loan: "#EC4899", // Other
  MoMo: "#F59E0B", // Digital Wallet
  VietinBank: "#10B981", // Savings Account
  ZaloPay: "#F59E0B", // Digital Wallet
  ViettelPay: "#F59E0B", // Digital Wallet
  "Stock Investment": "#8B5CF6", // Stock Portfolio
};
