import { assets, type Asset, type InsertAsset, type UpdateAsset, assetSourceSchema } from "@shared/schema";

export interface IStorage {
  getAllAssets(): Promise<Asset[]>;
  getAsset(id: number): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: UpdateAsset): Promise<Asset | undefined>;
  deleteAsset(id: number): Promise<boolean>;
  
  // Custom sources management
  getAllSources(): Promise<string[]>;
  addSource(source: string): Promise<{ name: string }>;
  updateSource(oldSource: string, newSource: string): Promise<{ name: string }>;
  deleteSource(source: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private assets: Map<number, Asset>;
  private currentId: number;
  private customSources: Set<string>;

  constructor() {
    this.assets = new Map();
    this.currentId = 1;
    this.customSources = new Set<string>();
    
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
    // Ensure description is null if it's undefined
    const description = insertAsset.description === undefined ? null : insertAsset.description;
    const asset: Asset = { 
      ...insertAsset, 
      description, 
      id, 
      updatedAt: now 
    };
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

  // Custom sources methods
  async getAllSources(): Promise<string[]> {
    // Get sources from assetSourceSchema enum values and add custom sources
    const enumSources = Object.values(assetSourceSchema.enum);
    const customSourcesArray = Array.from(this.customSources);
    const allSources = [...enumSources, ...customSourcesArray];
    
    // Return unique sources
    return Array.from(new Set(allSources));
  }

  async addSource(source: string): Promise<{ name: string }> {
    this.customSources.add(source);
    return { name: source };
  }

  async updateSource(oldSource: string, newSource: string): Promise<{ name: string }> {
    // Check if the source exists in custom sources
    if (this.customSources.has(oldSource)) {
      this.customSources.delete(oldSource);
      this.customSources.add(newSource);
    } else {
      // If not in custom sources, add as a new source
      this.customSources.add(newSource);
    }

    // Update any assets that use the old source name
    this.assets.forEach((asset, key) => {
      if (asset.source === oldSource) {
        const updatedAsset = { ...asset, source: newSource, updatedAt: new Date() };
        this.assets.set(key, updatedAsset);
      }
    });

    return { name: newSource };
  }

  async deleteSource(source: string): Promise<boolean> {
    // Only allow deletion of custom sources, not enum sources
    if (this.customSources.has(source)) {
      return this.customSources.delete(source);
    }
    
    // Cannot delete sources from the enum
    return false;
  }
}

export const storage = new MemStorage();
