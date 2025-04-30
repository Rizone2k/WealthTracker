import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssetSchema, updateAssetSchema } from "@shared/schema";
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
