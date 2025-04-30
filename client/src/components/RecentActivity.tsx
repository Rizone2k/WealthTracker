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

  const getActivityIcon = (asset: Asset) => {
    // Use a consistent indicator icon based on the asset source
    // In a future version, this could be based on the type of activity
    return (
      <div className="bg-blue-100 rounded-full p-2 mr-3">
        <Edit className="h-4 w-4 text-blue-500" />
      </div>
    );
  };

  const getActivityDescription = (asset: Asset) => {
    // For now, we just display the source as the main descriptor
    // In a real app with transaction history, this would show the actual action
    return `${asset.source}`;
  };

  const getActivityAmount = (asset: Asset) => {
    // Display actual amount rather than mock data
    return (
      <p className="text-sm font-medium text-blue-500">{formatCurrency(asset.amount)}</p>
    );
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
                {getActivityIcon(asset)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {getActivityDescription(asset)}
                  </p>
                  {asset.description && (
                    <p className="text-xs text-gray-700 italic">
                      "{asset.description}"
                    </p>
                  )}
                  <p className="text-xs text-gray-500">{formatDate(asset.updatedAt)}</p>
                </div>
                {getActivityAmount(asset)}
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
