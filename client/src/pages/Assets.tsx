import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, X } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SourceResponse {
  name: string;
}

export default function Assets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for source management
  const [newSource, setNewSource] = useState("");
  const [editingSource, setEditingSource] = useState<{
    index: number;
    value: string;
    original: string;
  } | null>(null);

  // Fetch sources
  const { data: sources = [] } = useQuery<string[]>({
    queryKey: ["/api/sources"],
  });

  // Add a new source
  const handleAddSource = async () => {
    if (!newSource.trim()) {
      toast({
        title: "Error",
        description: "Source name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (sources.includes(newSource)) {
      toast({
        title: "Error",
        description: "Source already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest<SourceResponse>("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSource }),
      });

      queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
      setNewSource("");
      
      toast({
        title: "Success",
        description: "Source added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add source",
        variant: "destructive",
      });
    }
  };

  // Edit source
  const handleEditSource = (index: number) => {
    setEditingSource({
      index,
      value: sources[index],
      original: sources[index],
    });
  };

  // Update source
  const handleUpdateSource = async () => {
    if (!editingSource) return;

    if (!editingSource.value.trim()) {
      toast({
        title: "Error",
        description: "Source name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (
      sources.includes(editingSource.value) &&
      editingSource.value !== editingSource.original
    ) {
      toast({
        title: "Error",
        description: "Source already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest<SourceResponse>(`/api/sources/${encodeURIComponent(editingSource.original)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingSource.value }),
      });

      queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      setEditingSource(null);
      
      toast({
        title: "Success",
        description: "Source updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update source",
        variant: "destructive",
      });
    }
  };

  // Delete source
  const handleDeleteSource = async (index: number) => {
    const source = sources[index];
    
    try {
      const response = await apiRequest<Response>(`/api/sources/${encodeURIComponent(source)}`, {
        method: "DELETE",
      });
      
      if (response.status === 400) {
        toast({
          title: "Error",
          description: "Cannot delete source that is in use",
          variant: "destructive",
        });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
      
      toast({
        title: "Success",
        description: "Source deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete source",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Assets</h1>
          <p className="text-gray-500">Manage your assets and asset sources</p>
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