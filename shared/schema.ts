
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

// Remove the enum restriction, allow any string for source
export const assetSourceSchema = z.string().min(1, "Source name is required");
export type AssetSource = z.infer<typeof assetSourceSchema>;

// Default color mapping for common sources
export const ASSET_SOURCE_COLORS: Record<string, string> = {
  "Cryptocurrency": "#3B82F6",
  "Savings Account": "#10B981", 
  "Investment Fund": "#6366F1",
  "Digital Wallet": "#F59E0B",
  "Stock Portfolio": "#8B5CF6",
  "Real Estate": "#EF4444",
  "Vehicle": "#7C3AED",
  "Other": "#EC4899"
};
