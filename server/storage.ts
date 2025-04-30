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
    const customSourcesArray = Array.from(this.customSources)
      // Filter out "deleted" markers
      .filter(source => !source.startsWith('__deleted_'));
      
    // Find deleted sources to exclude
    const deletedSources = Array.from(this.customSources)
      .filter(source => source.startsWith('__deleted_'))
      .map(source => source.replace('__deleted_', ''));
    
    // Filter out enum sources that have been "deleted"
    const filteredEnumSources = enumSources.filter(
      source => !deletedSources.includes(source)
    );
    
    const allSources = [...filteredEnumSources, ...customSourcesArray];
    
    // Return unique sources
    return Array.from(new Set(allSources));
  }

  async addSource(source: string): Promise<{ name: string }> {
    this.customSources.add(source);
    return { name: source };
  }

  async updateSource(oldSource: string, newSource: string): Promise<{ name: string }> {
    // All sources are editable
    
    // For enum sources (default ones), we need to store in customSources 
    // to track the changes since we can't modify the enum
    const enumSources = Object.values(assetSourceSchema.enum);
    const isEnumSource = enumSources.includes(oldSource as any);
    
    // If it's not a custom source already, add to custom sources
    if (!this.customSources.has(oldSource)) {
      this.customSources.add(newSource);
    } else {
      // Update existing custom source
      this.customSources.delete(oldSource);
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
    // Check if any assets are using this source
    const assetsUsingSource = Array.from(this.assets.values()).some(
      asset => asset.source === source
    );
    
    if (assetsUsingSource) {
      // Cannot delete sources that are in use
      return false;
    }
    
    // Delete from custom sources
    if (this.customSources.has(source)) {
      return this.customSources.delete(source);
    }
    
    // For built-in sources, we add to a "deleted" list
    // (this is a workaround since we can't remove from the enum)
    this.customSources.add(`__deleted_${source}`);
    return true;
  }
}

export const storage = new MemStorage();
