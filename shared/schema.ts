import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  amount: integer("amount").notNull(),
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
  "Cash",
  "Savings Account",
  "Investment Fund",
  "Digital Wallet",
  "Stock Portfolio",
  "Real Estate",
  "Gold & Jewelry",
  "Cryptocurrency",
  "Bonds",
  "Foreign Currency",
  "Vehicle",
  "Other"
]);

export type AssetSource = z.infer<typeof assetSourceSchema>;

// Default asset sources with their colors
export const ASSET_SOURCE_COLORS: Record<string, string> = {
  "Cash": "#3B82F6", // primary blue
  "Savings Account": "#10B981", // green
  "Investment Fund": "#6366F1", // indigo
  "Digital Wallet": "#F59E0B", // amber
  "Stock Portfolio": "#8B5CF6", // purple
  "Real Estate": "#EF4444", // red
  "Gold & Jewelry": "#F59E0B", // amber/gold
  "Cryptocurrency": "#2563EB", // blue
  "Bonds": "#059669", // emerald
  "Foreign Currency": "#0EA5E9", // sky blue
  "Vehicle": "#7C3AED", // violet
  "Other": "#EC4899", // pink
};
