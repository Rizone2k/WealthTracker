import { useState } from "react";
import { Asset } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
// Importing utilities and components
import { 
  Wallet, PiggyBank, LineChart, Smartphone, BarChart, Home, 
  GemIcon, Bitcoin, BadgeDollarSign, Globe, Car
} from "lucide-react";

interface GroupedAssetTableProps {
  assets: Asset[];
  onAddClick: () => void;
}

// Function to get the appropriate icon for each source
const getGroupAssetIcon = (source: string) => {
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

export default function GroupedAssetTable({ assets, onAddClick }: GroupedAssetTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Group assets by source
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
  const groupedAssetsArray = Object.values(groupedAssets).sort(
    (a, b) => b.totalAmount - a.totalAmount
  );
  
  // Filter based on search term
  const filteredAssets = groupedAssetsArray.filter((group) =>
    group.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-lg font-bold text-gray-900">Grouped Assets</h2>
        <div className="flex items-center w-full md:w-auto">
          <div className="relative w-full md:w-auto mr-2">
            <Input
              type="text"
              placeholder="Search sources..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <Button onClick={onAddClick} size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
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
            {filteredAssets.length > 0 ? (
              filteredAssets.map((group) => (
                <TableRow key={group.source} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        {getGroupAssetIcon(group.source)}
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
      </div>
      
      {filteredAssets.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {filteredAssets.length} sources with {assets.length} total assets
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
  );
}