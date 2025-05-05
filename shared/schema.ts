
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("active"),
  transactionType: text("transaction_type").notNull(),
  metadata: jsonb("metadata"),
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

export const TRANSACTION_TYPES = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  TRANSFER: "transfer"
} as const;

export const ASSET_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending"
} as const;

export const assetSourceSchema = z.enum([
  "Cash",
  "Savings Account", 
  "Investment Fund",
  "Digital Wallet",
  "Stock Portfolio",
  "Real Estate",
  "Vehicle"
]);

export type AssetSource = z.infer<typeof assetSourceSchema>;

export const ASSET_SOURCE_COLORS: Record<string, string> = {
  'Cash': '#22c55e',
  'Savings Account': '#3b82f6',
  'Investment Fund': '#f59e0b', 
  'Digital Wallet': '#8b5cf6',
  'Stock Portfolio': '#ec4899',
  'Real Estate': '#14b8a6',
  'Vehicle': '#f43f5e',
};
