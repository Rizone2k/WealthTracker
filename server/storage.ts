import { assets, type Asset, type InsertAsset, type UpdateAsset } from "@shared/schema";

export interface IStorage {
  getAllAssets(): Promise<Asset[]>;
  getAsset(id: number): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: UpdateAsset): Promise<Asset | undefined>;
  deleteAsset(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private assets: Map<number, Asset>;
  private currentId: number;

  constructor() {
    this.assets = new Map();
    this.currentId = 1;
    
    // Add some sample assets for development
    this.initSampleAssets();
  }

  private initSampleAssets() {
    const sampleAssets: InsertAsset[] = [
      { source: "Cash", amount: 32000000, description: "Physical cash at home" },
      { source: "Savings Account", amount: 45000000, description: "Bank savings account" },
      { source: "Investment Fund", amount: 23500000, description: "Mutual fund investment" },
      { source: "Digital Wallet", amount: 12000000, description: "E-wallet" },
      { source: "Stock Portfolio", amount: 8000000, description: "Stock investments" }
    ];

    sampleAssets.forEach(asset => this.createAsset(asset));
  }

  async getAllAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values());
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = this.currentId++;
    const now = new Date();
    const asset: Asset = { ...insertAsset, id, updatedAt: now };
    this.assets.set(id, asset);
    return asset;
  }

  async updateAsset(id: number, updateAsset: UpdateAsset): Promise<Asset | undefined> {
    const existingAsset = this.assets.get(id);
    
    if (!existingAsset) {
      return undefined;
    }
    
    const updatedAsset: Asset = {
      ...existingAsset,
      ...updateAsset,
      updatedAt: new Date()
    };
    
    this.assets.set(id, updatedAsset);
    return updatedAsset;
  }

  async deleteAsset(id: number): Promise<boolean> {
    return this.assets.delete(id);
  }
}

export const storage = new MemStorage();
