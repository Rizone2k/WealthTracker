import { Asset } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

interface RecentActivityProps {
  assets: Asset[];
}

export default function RecentActivity({ assets }: RecentActivityProps) {
  // Sort assets by updated date (newest first)
  const sortedAssets = [...assets].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Take only the first 5 most recent assets
  const recentAssets = sortedAssets.slice(0, 5);

  // Determine activity type and amount for each asset
  // In a real application, this would come from a transaction history
  // For now, we'll use the full amount of the asset
  const getMoneyMovement = (asset: Asset, index: number): number => {
    // Uses the full asset amount to show the transaction value
    // In the future, this would be replaced with actual transaction history data
    
    // For the first asset (newest), we'll show it as a deposit
    if (index === 0) {
      return asset.amount; // Full amount as deposit
    } 
    // For the second asset, also show as deposit
    else if (index === 1) {
      return asset.amount;
    } 
    // For the third asset, show as withdrawal
    else if (index === 2) {
      return -asset.amount;
    } 
    // For the rest, alternate between deposit and withdrawal
    else {
      return index % 2 === 0 ? asset.amount : -asset.amount;
    }
  };

  const getActivityIcon = (movement: number) => {
    if (movement > 0) {
      return (
        <div className="bg-green-100 rounded-full p-2 mr-3">
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
      );
    } else if (movement < 0) {
      return (
        <div className="bg-red-100 rounded-full p-2 mr-3">
          <TrendingDown className="h-4 w-4 text-red-500" />
        </div>
      );
    } else {
      return (
        <div className="bg-blue-100 rounded-full p-2 mr-3">
          <Plus className="h-4 w-4 text-blue-500" />
        </div>
      );
    }
  };

  const getActivityDescription = (movement: number, asset: Asset) => {
    if (movement > 0) {
      return `Added to ${asset.source}`;
    } else if (movement < 0) {
      return `Withdrawn from ${asset.source}`;
    } else {
      return `Updated ${asset.source}`;
    }
  };

  const getActivityAmount = (movement: number) => {
    if (movement > 0) {
      return (
        <p className="text-sm font-medium text-green-500">+{formatCurrency(movement)}</p>
      );
    } else if (movement < 0) {
      return (
        <p className="text-sm font-medium text-red-500">{formatCurrency(movement)}</p>
      );
    } else {
      return (
        <p className="text-sm font-medium text-indigo-500">±0 ₫</p>
      );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="link" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAssets.length > 0 ? (
            recentAssets.map((asset, index) => {
              const movement = getMoneyMovement(asset, index);
              return (
                <div key={asset.id} className="flex items-start">
                  {getActivityIcon(movement)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getActivityDescription(movement, asset)}
                    </p>
                    {asset.description && (
                      <p className="text-xs text-gray-600 italic">
                        "{asset.description}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500">{formatDate(asset.updatedAt)}</p>
                  </div>
                  {getActivityAmount(movement)}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 py-4 text-center">
              No recent activity to display
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}