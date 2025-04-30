import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Pencil, Check, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AssetSource } from "@shared/schema";

interface SourceResponse {
  name: string;
}

export default function Settings() {
  const { toast } = useToast();
  const [sources, setSources] = useState<string[]>([]);
  const [newSource, setNewSource] = useState("");
  const [editingSource, setEditingSource] = useState<{ index: number; value: string } | null>(null);
  
  // Check if a source is a default (built-in) source
  const isDefaultSource = (source: string): boolean => {
    const defaultSources = ["Cash", "Savings Account", "Investment Fund", "Digital Wallet", "Stock Portfolio", "Real Estate", "Gold & Jewelry", "Cryptocurrency", "Bonds", "Foreign Currency", "Vehicle", "Other"];
    return defaultSources.includes(source);
  };

  useEffect(() => {
    // Fetch sources from the API
    const fetchSources = async () => {
      try {
        const response = await apiRequest("GET", "/api/sources");
        if (Array.isArray(response)) {
          setSources(response);
        }
      } catch (error) {
        console.error("Failed to fetch sources:", error);
        toast({
          title: "Error",
          description: "Failed to fetch asset sources",
          variant: "destructive",
        });
      }
    };

    fetchSources();
  }, [toast]);

  const handleAddSource = async () => {
    if (!newSource.trim()) return;

    try {
      const response = await apiRequest<{ name: string }>("POST", "/api/sources", { name: newSource });
      setSources([...sources, response.name]);
      setNewSource("");
      toast({
        title: "Success",
        description: "Asset source added successfully",
      });
    } catch (error) {
      console.error("Failed to add source:", error);
      toast({
        title: "Error",
        description: "Failed to add asset source",
        variant: "destructive",
      });
    }
  };

  const handleEditSource = (index: number) => {
    setEditingSource({ index, value: sources[index] });
  };

  const handleUpdateSource = async () => {
    if (!editingSource || !editingSource.value.trim()) return;

    try {
      const oldSource = sources[editingSource.index];
      const response = await apiRequest<{ name: string }>("PUT", `/api/sources/${oldSource}`, {
        name: editingSource.value,
      });

      const updatedSources = [...sources];
      updatedSources[editingSource.index] = response.name;
      setSources(updatedSources);
      setEditingSource(null);

      toast({
        title: "Success",
        description: "Asset source updated successfully",
      });
    } catch (error) {
      console.error("Failed to update source:", error);
      toast({
        title: "Error",
        description: "Failed to update asset source",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSource = async (index: number) => {
    const sourceToDelete = sources[index];
    
    // Check if it's a default source that cannot be deleted
    if (isDefaultSource(sourceToDelete)) {
      toast({
        title: "Cannot Delete",
        description: "Default sources cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("DELETE", `/api/sources/${sourceToDelete}`);
      
      const updatedSources = [...sources];
      updatedSources.splice(index, 1);
      setSources(updatedSources);

      toast({
        title: "Success",
        description: "Asset source deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete source:", error);
      toast({
        title: "Error",
        description: "Failed to delete asset source. Standard sources cannot be deleted.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500">Manage your application preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Asset Sources</CardTitle>
            <CardDescription>
              Manage the types of asset sources you can use in the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter new source name"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
              />
              <Button onClick={handleAddSource}>
                <Plus className="mr-2 h-4 w-4" />
                Add Source
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Name</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {editingSource?.index === index ? (
                        <Input
                          value={editingSource.value}
                          onChange={(e) =>
                            setEditingSource({
                              ...editingSource,
                              value: e.target.value,
                            })
                          }
                          className="max-w-xs"
                        />
                      ) : (
                        <div className="flex items-center">
                          {source}
                          {isDefaultSource(source) && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                              Default
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {editingSource?.index === index ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleUpdateSource}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingSource(null)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSource(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSource(index)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sources.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-gray-500">
                      No custom sources added yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}