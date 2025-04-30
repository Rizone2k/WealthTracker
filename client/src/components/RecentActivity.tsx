import { Asset } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, Edit } from "lucide-react";
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

  // Take only the first 4 most recent assets
  const recentAssets = sortedAssets.slice(0, 4);

  const getActivityIcon = (index: number) => {
    // Just for simulation, we'll use different icons for demonstration
    // In a real app, this would be based on the type of activity (add, remove, update)
    if (index % 3 === 0) {
      return (
        <div className="bg-blue-100 rounded-full p-2 mr-3">
          <Plus className="h-4 w-4 text-blue-500" />
        </div>
      );
    } else if (index % 3 === 1) {
      return (
        <div className="bg-red-100 rounded-full p-2 mr-3">
          <Minus className="h-4 w-4 text-red-500" />
        </div>
      );
    } else {
      return (
        <div className="bg-indigo-100 rounded-full p-2 mr-3">
          <Edit className="h-4 w-4 text-indigo-500" />
        </div>
      );
    }
  };

  const getActivityDescription = (index: number, asset: Asset) => {
    // For demonstration purposes
    if (index % 3 === 0) {
      return `Added to ${asset.source}`;
    } else if (index % 3 === 1) {
      return `Removed from ${asset.source}`;
    } else {
      return `Updated ${asset.source}`;
    }
  };

  const getActivityAmount = (index: number, asset: Asset) => {
    if (index % 3 === 0) {
      return (
        <p className="text-sm font-medium text-green-500">+{formatCurrency(asset.amount)}</p>
      );
    } else if (index % 3 === 1) {
      return (
        <p className="text-sm font-medium text-red-500">-{formatCurrency(asset.amount / 4)}</p>
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
            recentAssets.map((asset, index) => (
              <div key={asset.id} className="flex items-start">
                {getActivityIcon(index)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {getActivityDescription(index, asset)}
                  </p>
                  {asset.description && (
                    <p className="text-xs text-gray-600 italic">
                      "{asset.description}"
                    </p>
                  )}
                  <p className="text-xs text-gray-500">{formatDate(asset.updatedAt)}</p>
                </div>
                {getActivityAmount(index, asset)}
              </div>
            ))
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
