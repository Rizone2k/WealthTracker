import { assets, type Asset, type InsertAsset, type UpdateAsset, assetSourceSchema } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '../data/storage.json');

// Ensure the data directory exists
function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Create a default data structure
function createDefaultData() {
  return {
    assets: [],
    nextId: 1,
    customSources: []
  };
}

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

export class FileStorage implements IStorage {
  private assets: Map<number, Asset>;
  private currentId: number;
  private customSources: Set<string>;

  constructor() {
    this.assets = new Map();
    this.currentId = 1;
    this.customSources = new Set<string>();
    
    // Load existing data if available
    this.loadData();
  }

  private loadData() {
    ensureDataDir();
    
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        
        // Load assets
        if (data.assets && Array.isArray(data.assets)) {
          data.assets.forEach((asset: Asset) => {
            this.assets.set(asset.id, asset);
          });
        }
        
        // Load ID counter
        if (data.nextId && typeof data.nextId === 'number') {
          this.currentId = data.nextId;
        }
        
        // Load custom sources
        if (data.customSources && Array.isArray(data.customSources)) {
          data.customSources.forEach((source: string) => {
            this.customSources.add(source);
          });
        }
        
        console.log(`Loaded ${this.assets.size} assets from storage file`);
      } else {
        // Initialize with sample data if no file exists
        this.initSampleAssets();
        this.saveData();
        console.log('Created new storage file with sample data');
      }
    } catch (error) {
      console.error('Error loading data from file:', error);
      // Fall back to sample data
      this.initSampleAssets();
    }
  }
  
  private saveData() {
    ensureDataDir();
    
    try {
      const data = {
        assets: Array.from(this.assets.values()),
        nextId: this.currentId,
        customSources: Array.from(this.customSources)
      };
      
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving data to file:', error);
    }
  }

  private initSampleAssets() {
    // Initialize with empty data
    this.assets = new Map();
    this.currentId = 1;
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
    // Ensure month is a valid date
    const month = new Date(insertAsset.month);
    const asset: Asset = { 
      ...insertAsset, 
      description,
      month, 
      id, 
      updatedAt: now 
    };
    this.assets.set(id, asset);
    this.saveData();
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
    this.saveData();
    return updatedAsset;
  }

  async deleteAsset(id: number): Promise<boolean> {
    const result = this.assets.delete(id);
    if (result) {
      this.saveData();
    }
    return result;
  }

  // Custom sources methods
  async getAllSources(): Promise<string[]> {
    // Get default sources from enum
    const enumSources = Object.values(assetSourceSchema.enum);
    
    // Get all custom sources, excluding special markers
    const customSourcesArray = Array.from(this.customSources)
      .filter(source => !source.startsWith('__'));
      
    // Find deleted sources to exclude
    const deletedSources = Array.from(this.customSources)
      .filter(source => source.startsWith('__deleted_'))
      .map(source => source.replace('__deleted_', ''));
      
    // Find modified enum sources to exclude
    const changedSources = Array.from(this.customSources)
      .filter(source => source.startsWith('__changed_'))
      .map(source => source.replace('__changed_', ''));
    
    // Filter out enum sources that have been deleted or modified
    const filteredEnumSources = enumSources.filter(
      source => !deletedSources.includes(source) && !changedSources.includes(source)
    );
    
    // Combine filtered enum sources with custom sources
    const allSources = [...filteredEnumSources, ...customSourcesArray];
    
    // Return unique sources
    return Array.from(new Set(allSources));
  }

  async addSource(source: string): Promise<{ name: string }> {
    this.customSources.add(source);
    this.saveData();
    return { name: source };
  }

  async updateSource(oldSource: string, newSource: string): Promise<{ name: string }> {
    // Handle both enum sources and custom sources
    const enumSources = Object.values(assetSourceSchema.enum);
    const isEnumSource = enumSources.includes(oldSource as any);
    
    // Add the new source to custom sources (tracks overrides for enum sources)
    this.customSources.add(newSource);
    
    // If this is an enum source, mark it as "changed" with a special prefix
    if (isEnumSource) {
      this.customSources.add(`__changed_${oldSource}`);
    } 
    // If this is a custom source, remove the old one
    else if (this.customSources.has(oldSource)) {
      this.customSources.delete(oldSource);
    }
    
    // Update any assets that use the old source name
    this.assets.forEach((asset, key) => {
      if (asset.source === oldSource) {
        const updatedAsset = { ...asset, source: newSource, updatedAt: new Date() };
        this.assets.set(key, updatedAsset);
      }
    });
    
    this.saveData();
    return { name: newSource };
  }

  async deleteSource(source: string): Promise<boolean> {
    // Check if this is the last source with assets
    const sources = await this.getAllSources();
    const sourcesWithAssets = sources.filter(s => 
      Array.from(this.assets.values()).some(asset => asset.source === s)
    );
    
    if (sourcesWithAssets.length === 1 && sourcesWithAssets[0] === source) {
      return false;
    }
    
    // Delete source and all associated assets
    const assetsToDelete = Array.from(this.assets.values())
      .filter(asset => asset.source === source);
      
    // Delete all assets with this source
    assetsToDelete.forEach(asset => {
      this.assets.delete(asset.id);
    });
    
    // Delete the source itself
    let result = this.customSources.delete(source);
    
    // For built-in sources, mark as deleted
    if (!result) {
      this.customSources.add(`__deleted_${source}`);
      result = true;
    }
    
    this.saveData();
    return result;
  }
}

// Use the new FileStorage implementation
export const storage = new FileStorage();
