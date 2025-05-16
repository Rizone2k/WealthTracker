import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import MetricsOverview from "@/components/MetricsOverview";
import AssetDistribution from "@/components/AssetDistribution";
import RecentActivity from "@/components/RecentActivity";
import AssetTable from "@/components/AssetTable";
import AssetForm from "@/components/AssetForm";
import AssetTracking from "@/components/AssetTracking";
import { Asset } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);

  // Fetch assets data
  const { data: assets = [], isLoading: assetsLoading, error: assetsError } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });
  
  // Fetch sources data
  const { data: sources = [], isLoading: sourcesLoading } = useQuery<string[]>({
    queryKey: ["/api/sources"],
  });
  
  // Combined loading state
  const isLoading = assetsLoading || sourcesLoading;
  
  // Get all unique months
  const months = [...new Set(assets.map(asset => {
    const date = new Date(asset.month);
    return date.toISOString().slice(0, 7); // YYYY-MM format
  }))].sort().reverse();

  // Default to latest month
  const [selectedMonth, setSelectedMonth] = useState(months[0] || '');

  // Update selected month when assets change
  useEffect(() => {
    if (months.length > 0 && !months.includes(selectedMonth)) {
      setSelectedMonth(months[0]);
    }
  }, [assets]);

  // Create merged assets by combining amounts for the same source
  const mergedAssets = useMemo(() => {
    if (!assets.length) return [];
    
    // Group by source
    const groupedBySource = assets.reduce((acc, asset) => {
      if (!acc[asset.source]) {
        acc[asset.source] = {
          id: -1 * (Object.keys(acc).length + 1), // Use negative numbers for merged assets
          source: asset.source,
          amount: 0,
          description: asset.description || `Combined ${asset.source} assets`,
          updatedAt: new Date(0),
          _originalAssets: [] // Private field to store original assets
        };
      }
      
      // Add amount
      acc[asset.source].amount += asset.amount;
      
      // Track the latest update
      const assetDate = new Date(asset.updatedAt);
      if (assetDate > new Date(acc[asset.source].updatedAt)) {
        acc[asset.source].updatedAt = asset.updatedAt;
      }
      
      // Keep track of original assets
      acc[asset.source]._originalAssets.push(asset);
      
      return acc;
    }, {} as Record<string, Asset & { _originalAssets: Asset[] }>);
    
    return Object.values(groupedBySource);
  }, [assets]);

  const handleAddAssetClick = () => {
    // Force refresh sources before opening the form
    queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
    setIsAddAssetModalOpen(true);
  };

  const handleAssetChange = () => {
    // Invalidate both assets and sources
    queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
    queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
  };
  
  // Effect to refresh sources data when component mounts or when needed
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
  }, [queryClient]);

  // Show toast when there's an error loading assets
  useEffect(() => {
    if (assetsError) {
      toast({
        title: "Error",
        description: "Failed to load assets",
        variant: "destructive",
      });
    }
  }, [assetsError, toast]);

  return (
    <Layout onAddAsset={handleAddAssetClick}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Manage and track your assets</p>
        </div>
        <Button
          onClick={handleAddAssetClick}
          className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Asset</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <MetricsOverview assets={assets} selectedMonth={selectedMonth} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {isLoading ? (
          <>
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 mb-6 md:mb-0 flex justify-center">
                  <div className="w-64 h-64 bg-gray-200 rounded-full"></div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-gray-200 mr-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start">
                    <div className="bg-gray-200 rounded-full p-2 mr-3 w-8 h-8"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="lg:col-span-2">
              <AssetDistribution 
                assets={assets} 
                onAddClick={handleAddAssetClick}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </div>
            <RecentActivity assets={assets} />
          </>
        )}
      </div>
        {isLoading ? (
          <>
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 mb-6 md:mb-0 flex justify-center">
                  <div className="w-64 h-64 bg-gray-200 rounded-full"></div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-gray-200 mr-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start">
                    <div className="bg-gray-200 rounded-full p-2 mr-3 w-8 h-8"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <RecentActivity assets={assets} />
          </>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="overflow-x-auto">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
            ))}
          </div>
        </div>
      ) : (
        <AssetTable 
          assets={mergedAssets} 
          onAssetChange={handleAssetChange}
          sources={sources}
        />
      )}

      <AssetForm
        isOpen={isAddAssetModalOpen}
        onClose={() => setIsAddAssetModalOpen(false)}
        onSuccess={handleAssetChange}
        sources={sources}
      />
    </Layout>
  );
}
