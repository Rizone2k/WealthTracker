import { Asset, ASSET_SOURCE_COLORS } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartComponent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw, Plus } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface AssetDistributionProps {
  assets: Asset[];
  onAddClick: () => void;
}

export default function AssetDistribution({ assets, onAddClick }: AssetDistributionProps) {
  // Find the latest month from assets
  const latestMonth = assets.reduce((latest, asset) => {
    const assetDate = new Date(asset.month);
    return latest && latest > assetDate ? latest : assetDate;
  }, null as Date | null);

  // Filter assets for the latest month only
  const latestMonthAssets = assets.filter(asset => {
    if (!latestMonth) return false;
    const assetMonth = new Date(asset.month);
    return assetMonth.getMonth() === latestMonth.getMonth() && 
           assetMonth.getFullYear() === latestMonth.getFullYear();
  });

  // Group assets by source and calculate totals
  const assetGroups = latestMonthAssets.reduce((acc, asset) => {
    const source = asset.source;
    if (!acc[source]) {
      acc[source] = 0;
    }
    acc[source] += asset.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total of all assets
  const totalAmount = Object.values(assetGroups).reduce((sum, amount) => sum + amount, 0);

  // Sort by amount descending
  const sortedEntries = Object.entries(assetGroups).sort((a, b) => b[1] - a[1]);
  
  // Prepare chart data
  const chartData = {
    labels: sortedEntries.map(([source]) => source),
    values: sortedEntries.map(([_, amount]) => amount),
    colors: sortedEntries.map(([source]) => ASSET_SOURCE_COLORS[source] || "#" + Math.floor(Math.random() * 16777215).toString(16))
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Asset Distribution</CardTitle>
          <CardDescription>
            {latestMonth 
              ? `Assets distribution for ${latestMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` 
              : 'See how your assets are distributed'}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 mb-6 md:mb-0 flex justify-center items-center">
            {assets.length > 0 ? (
              <div className="w-64 h-64">
                <ChartComponent data={chartData} type="doughnut" />
              </div>
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-gray-400 flex-col">
                <p className="text-center mb-4">No assets to display</p>
                <Button onClick={onAddClick} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" /> Add Asset
                </Button>
              </div>
            )}
          </div>
          <div className="w-full md:w-1/2">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Legend</h3>
              {assets.length > 0 ? (
                sortedEntries.map(([source, amount], index) => (
                  <div key={index} className="flex items-center mb-2">
                    <div 
                      className="w-3 h-3 rounded-full mr-3" 
                      style={{ backgroundColor: chartData.colors[index] }}
                    ></div>
                    <span className="text-sm text-gray-700 flex-1">{source}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900 block">
                        {formatCurrency(amount)}
                      </span>
                      <span className="text-xs text-gray-500 block">
                        {formatPercentage(amount, totalAmount)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Add assets to see distribution</p>
              )}
            </div>
            <Button 
              onClick={onAddClick} 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> 
              <span>Quick Add</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
