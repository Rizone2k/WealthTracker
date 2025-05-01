import { useState, useEffect } from "react";
import { Asset } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  Trash, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  PiggyBank, 
  Wallet, 
  LineChart, 
  Smartphone, 
  BarChart,
  Home,
  GemIcon,
  Bitcoin,
  BadgeDollarSign,
  Globe,
  Car,
  LayoutGrid,
  LayoutList,
  Save,
  X
} from "lucide-react";
import { formatCurrency, formatDate, parseFormattedCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AssetForm from "./AssetForm";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AssetTableProps {
  assets: Asset[];
  onAssetChange: () => void;
  sources?: string[];
}

export default function AssetTable({ assets, onAssetChange, sources = [] }: AssetTableProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editAsset, setEditAsset] = useState<Asset | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [groupedView, setGroupedView] = useState(false);
  const [inlineEditAsset, setInlineEditAsset] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  
  // Check if assets contains merged assets with _originalAssets property
  const hasMergedAssets = assets.some((asset: any) => asset._originalAssets);
  
  // Refresh sources when assets change
  useEffect(() => {
    // Reset form when assets change to ensure it gets the latest sources
    if (isFormOpen) {
      setIsFormOpen(false);
      setTimeout(() => setIsFormOpen(true), 100);
    }
  }, [assets]);

  const filteredAssets = assets.filter((asset) =>
    asset.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.description && asset.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group assets by source (for grouped view)
  const groupedAssets = assets.reduce((acc, asset) => {
    const source = asset.source;
    if (!acc[source]) {
      acc[source] = {
        source,
        totalAmount: 0,
        count: 0,
        latestUpdate: new Date(0) // Start with epoch time
      };
    }
    
    acc[source].totalAmount += asset.amount;
    acc[source].count += 1;
    
    // Keep track of the most recent update
    const assetDate = new Date(asset.updatedAt);
    if (assetDate > acc[source].latestUpdate) {
      acc[source].latestUpdate = assetDate;
    }
    
    return acc;
  }, {} as Record<string, { 
    source: string; 
    totalAmount: number; 
    count: number; 
    latestUpdate: Date;
  }>);
  
  // Convert to array and sort by amount (highest first)
  const groupedAssetsArray = Object.values(groupedAssets)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .filter((group) => group.source.toLowerCase().includes(searchTerm.toLowerCase()));

  const getAssetIcon = (source: string) => {
    switch (source) {
      case "Cash":
        return <Wallet className="text-blue-500" />;
      case "Savings Account":
        return <PiggyBank className="text-green-500" />;
      case "Investment Fund":
        return <LineChart className="text-indigo-500" />;
      case "Digital Wallet":
        return <Smartphone className="text-yellow-500" />;
      case "Stock Portfolio":
        return <BarChart className="text-purple-500" />;
      case "Real Estate":
        return <Home className="text-red-500" />;
      case "Gold & Jewelry":
        return <GemIcon className="text-yellow-500" />;
      case "Cryptocurrency":
        return <Bitcoin className="text-blue-500" />;
      case "Bonds":
        return <BadgeDollarSign className="text-emerald-500" />;
      case "Foreign Currency":
        return <Globe className="text-sky-500" />;
      case "Vehicle":
        return <Car className="text-violet-500" />;
      default:
        return <Wallet className="text-pink-500" />;
    }
  };

  const handleEditClick = (asset: Asset) => {
    setEditAsset(asset);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!assetToDelete) return;
    
    try {
      await apiRequest(`/api/assets/${assetToDelete.id}`, {
        method: "DELETE"
      });
      toast({
        title: "Asset deleted",
        description: "Asset has been deleted successfully",
      });
      onAssetChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete asset",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };
  
  const startInlineEdit = (asset: Asset) => {
    setInlineEditAsset(asset.id);
    setEditAmount(formatCurrency(asset.amount));
    setEditDescription(asset.description || "");
  };
  
  const cancelInlineEdit = () => {
    setInlineEditAsset(null);
    setEditAmount("");
    setEditDescription("");
  };
  
  const saveInlineEdit = async (asset: Asset) => {
    try {
      // Parse the formatted amount back to a number
      const numericAmount = parseFormattedCurrency(editAmount);
      
      // Check if this is a merged asset with _originalAssets
      const isMerged = (asset as any)._originalAssets;
      
      if (isMerged) {
        // For merged assets, we'll update each original asset in the group
        const originalAssets = (asset as any)._originalAssets;
        
        // If this is a merged asset, just update the merged asset ID (backend handles the logic)
        await apiRequest(`/api/assets/${asset.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: numericAmount,
            description: editDescription
          })
        });
        
        toast({
          title: "Assets updated",
          description: `Successfully updated all ${originalAssets.length} assets in this group.`,
        });
      } else {
        // For regular assets, update normally
        await apiRequest(`/api/assets/${asset.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: numericAmount,
            description: editDescription
          })
        });
        
        toast({
          title: "Asset updated",
          description: "Asset has been updated successfully",
        });
      }
      
      // Reset the inline edit state
      setInlineEditAsset(null);
      setEditAmount("");
      setEditDescription("");
      
      // Refresh the assets
      onAssetChange();
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "Error",
        description: "Failed to update asset",
        variant: "destructive",
      });
    }
  };

  const renderDetailedTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => {
            // Check if this is a merged asset
            const isMerged = (asset as any)._originalAssets;
            const assetCount = isMerged ? (asset as any)._originalAssets.length : 1;
            
            return (
              <TableRow key={asset.id} className={`hover:bg-gray-50 ${isMerged ? 'bg-blue-50/30' : ''}`}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      {getAssetIcon(asset.source)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{asset.source}</span>
                      {isMerged && (
                        <div className="text-xs text-blue-600 font-medium">
                          Combined from {assetCount} entries
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {inlineEditAsset === asset.id ? (
                    <Input
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-28 text-sm"
                    />
                  ) : (
                    formatCurrency(asset.amount)
                  )}
                </TableCell>
                <TableCell className="text-gray-500">
                  {formatDate(asset.updatedAt)}
                </TableCell>
                <TableCell className="text-gray-500">
                  {inlineEditAsset === asset.id ? (
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full text-sm"
                      placeholder="Add description..."
                    />
                  ) : (
                    asset.description || "-"
                  )}
                </TableCell>
                <TableCell>
                  {inlineEditAsset === asset.id ? (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveInlineEdit(asset)}
                        className="h-8 w-8 p-0"
                      >
                        <Save className="h-4 w-4 text-green-500 hover:text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelInlineEdit}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-500 hover:text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      {!isMerged ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(asset)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(asset)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash className="h-4 w-4 text-gray-500 hover:text-red-500" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startInlineEdit(asset)}
                          className="h-8 px-2 py-0 text-xs"
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Quick Edit
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-6 text-gray-500">
              {searchTerm 
                ? "No assets found matching your search" 
                : "No assets added yet. Add your first asset!"}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderGroupedTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Assets Count</TableHead>
          <TableHead>Last Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groupedAssetsArray.length > 0 ? (
          groupedAssetsArray.map((group) => (
            <TableRow key={group.source} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    {getAssetIcon(group.source)}
                  </div>
                  <span className="font-medium text-gray-900">{group.source}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(group.totalAmount)}
              </TableCell>
              <TableCell className="text-center">
                {group.count}
              </TableCell>
              <TableCell className="text-gray-500">
                {new Date(group.latestUpdate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-6 text-gray-500">
              {searchTerm 
                ? "No assets found matching your search" 
                : "No assets added yet. Add your first asset!"}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">
              {groupedView ? "Assets by Source" : "All Assets"}
            </h2>
            <div className="flex items-center space-x-2">
              <LayoutList className={`h-4 w-4 ${!groupedView ? 'text-blue-500' : 'text-gray-500'}`} />
              <Switch 
                checked={groupedView} 
                onCheckedChange={setGroupedView} 
                id="view-mode" 
              />
              <LayoutGrid className={`h-4 w-4 ${groupedView ? 'text-blue-500' : 'text-gray-500'}`} />
            </div>
          </div>
          <div className="flex items-center w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Input
                type="text"
                placeholder="Search assets..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {groupedView ? renderGroupedTable() : renderDetailedTable()}
        </div>
        
        {(groupedView ? groupedAssetsArray : filteredAssets).length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {groupedView 
                ? `Showing ${groupedAssetsArray.length} sources with ${assets.length} total assets`
                : `Showing ${filteredAssets.length} of ${assets.length} assets`
              }
            </p>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-500 text-white">
                1
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Asset Form */}
      {isFormOpen && (
        <AssetForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditAsset(undefined);
          }}
          onSuccess={onAssetChange}
          editAsset={editAsset}
          sources={sources}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the asset "{assetToDelete?.source}" with
              amount {assetToDelete ? formatCurrency(assetToDelete.amount) : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}