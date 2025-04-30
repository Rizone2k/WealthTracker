import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssetSchema, updateAssetSchema, type Asset } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes for assets
  app.get("/api/assets", async (req, res) => {
    try {
      const assets = await storage.getAllAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.get("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }
      
      const asset = await storage.getAsset(id);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch asset" });
    }
  });

  app.post("/api/assets", async (req, res) => {
    try {
      const newAsset = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(newAsset);
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create asset" });
    }
  });

  app.put("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }
      
      const updateData = updateAssetSchema.parse(req.body);
      const updatedAsset = await storage.updateAsset(id, updateData);
      
      if (!updatedAsset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      res.json(updatedAsset);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update asset" });
    }
  });
  
  // PATCH endpoint for assets (supporting partial updates)
  app.patch("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Handle special case for merged assets (negative IDs)
      if (id < 0) {
        // This is a virtual merged asset - we need to find all assets with the same source
        // and update them with the new amount proportionally
        
        try {
          // Get all assets
          const allAssets = await storage.getAllAssets();
          
          // Find assets with the matching source based on the merged asset ID
          // For now, our frontend uses negative IDs where -1 is the first source, -2 is the second, etc.
          // So we need to get the proper source name
          
          // Group assets by source to get an array of unique sources in the same order as frontend
          const sourceGroups = allAssets.reduce((groups, asset) => {
            if (!groups[asset.source]) {
              groups[asset.source] = [];
            }
            groups[asset.source].push(asset);
            return groups;
          }, {} as Record<string, Asset[]>);
          
          // Convert to array and sort by total amount (highest first) to match frontend ordering
          const groupedSources = Object.entries(sourceGroups)
            .map(([source, assets]) => ({
              source,
              totalAmount: assets.reduce((sum, asset) => sum + asset.amount, 0),
              assets
            }))
            .sort((a, b) => b.totalAmount - a.totalAmount);
          
          // Now we can get the correct source based on the negative ID
          // -1 means first source, -2 means second source, etc.
          const sourceIndex = Math.abs(id) - 1;
          
          if (sourceIndex >= 0 && sourceIndex < groupedSources.length) {
            const sourceGroup = groupedSources[sourceIndex];
            const source = sourceGroup.source;
            
            // Get the assets with this source
            const assetsWithSource = allAssets.filter(asset => asset.source === source);
            
            // If there's an amount change, distribute it proportionally
            if (req.body.amount !== undefined) {
              const newTotalAmount = req.body.amount;
              const currentTotalAmount = assetsWithSource.reduce((sum, asset) => sum + asset.amount, 0);
              
              // Only update if the amount changed
              if (newTotalAmount !== currentTotalAmount) {
                const ratio = newTotalAmount / currentTotalAmount;
                
                // Update each asset with the new proportional amount
                const updatePromises = assetsWithSource.map(async (asset) => {
                  const newAmount = Math.round(asset.amount * ratio);
                  await storage.updateAsset(asset.id, { 
                    source: asset.source, // Preserve the existing source
                    amount: newAmount,
                    description: req.body.description !== undefined ? req.body.description : asset.description
                  });
                });
                
                await Promise.all(updatePromises);
              } else if (req.body.description !== undefined) {
                // If only description changed, update all assets with the new description
                const updatePromises = assetsWithSource.map(async (asset) => {
                  await storage.updateAsset(asset.id, { 
                    source: asset.source,
                    amount: asset.amount,
                    description: req.body.description 
                  });
                });
                
                await Promise.all(updatePromises);
              }
            }
            
            return res.status(200).json({ 
              message: `Updated ${assetsWithSource.length} assets for source "${source}"`,
              sourceCount: assetsWithSource.length,
              source
            });
          } else {
            return res.status(404).json({ message: "Source group not found" });
          }
        } catch (error) {
          console.error("Error updating merged assets:", error);
          return res.status(500).json({ message: "Failed to update merged assets" });
        }
      }
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }
      
      // We'll use a partial schema for PATCH
      // This isn't strictly necessary since we're not validating in this route
      const updateData = req.body;
      const updatedAsset = await storage.updateAsset(id, updateData);
      
      if (!updatedAsset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      res.json(updatedAsset);
    } catch (error) {
      res.status(500).json({ message: "Failed to update asset" });
    }
  });

  app.delete("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }
      
      const deleted = await storage.deleteAsset(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // API Routes for sources
  app.get("/api/sources", async (req, res) => {
    try {
      const sources = await storage.getAllSources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sources" });
    }
  });

  app.post("/api/sources", async (req, res) => {
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: "Source name is required" });
      }
      
      const result = await storage.addSource(name);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to add source" });
    }
  });

  app.put("/api/sources/:source", async (req, res) => {
    try {
      const oldSource = req.params.source;
      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: "New source name is required" });
      }
      
      // All sources are editable now
      
      const result = await storage.updateSource(oldSource, name);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to update source" });
    }
  });

  app.delete("/api/sources/:source", async (req, res) => {
    try {
      const source = req.params.source;
      const deleted = await storage.deleteSource(source);
      
      if (!deleted) {
        return res.status(400).json({ 
          message: "Source could not be deleted. Standard sources cannot be deleted." 
        });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete source" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
