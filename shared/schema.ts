
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

// Allow any non-empty string as source
export const assetSourceSchema = z.string().min(1, "Source name is required");
export type AssetSource = z.infer<typeof assetSourceSchema>;

// Default colors for common sources, fallback to gray if not found
export const ASSET_SOURCE_COLORS: Record<string, string> = {
  "Cryptocurrency": "#3B82F6",
  "Savings Account Viettel Money": "#10B981",
  "VietcomBank": "#6366F1",
  "Tui Than Tai": "#F59E0B",
  "Stock Investment": "#8B5CF6",
  "Loan": "#EF4444",
  "MoMo": "#7C3AED",
  "VietinBank": "#EC4899",
  "ZaloPay": "#059669",
  "ViettelPay": "#9333EA"
};
