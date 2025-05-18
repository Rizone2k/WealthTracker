
import { Asset } from "@shared/schema";
import { Banknote, Wallet, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

interface MetricsOverviewProps {
  assets: Asset[];
}

export default function MetricsOverview({ assets }: MetricsOverviewProps) {
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

  // Filter assets for selected month
  const monthlyAssets = assets.filter(asset => {
    const assetMonth = new Date(asset.month).toISOString().slice(0, 7);
    return assetMonth === selectedMonth;
  });

  // Calculate totals for selected month
  const totalAmount = calculateTotalAmount(monthlyAssets);
  const uniqueSources = new Set(monthlyAssets.map(asset => asset.source)).size;

  // Get last updated asset
  const lastUpdatedAsset = monthlyAssets.length > 0 
    ? monthlyAssets.reduce((latest, asset) => {
        const latestDate = new Date(latest.updatedAt);
        const currentDate = new Date(asset.updatedAt);
        return currentDate > latestDate ? asset : latest;
      })
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total Assets</h3>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px] mt-2">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {new Date(month).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-blue-100 rounded-full p-2">
            <Wallet className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
        <p className="mt-2 text-sm text-green-500 flex items-center">
          <span>Total across {monthlyAssets.length} assets</span>
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-500 text-sm font-medium">Asset Sources</h3>
          <div className="bg-indigo-100 rounded-full p-2">
            <Banknote className="h-5 w-5 text-indigo-500" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{uniqueSources}</p>
        <p className="mt-2 text-sm text-blue-500 flex items-center">
          <span>Diversified asset portfolio</span>
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-500 text-sm font-medium">Last Updated</h3>
          <div className="bg-green-100 rounded-full p-2">
            <Clock className="h-5 w-5 text-green-500" />
          </div>
        </div>
        <p className="text-lg font-bold text-gray-900">
          {lastUpdatedAsset ? formatDate(lastUpdatedAsset.updatedAt) : "No data"}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {lastUpdatedAsset 
            ? `${lastUpdatedAsset.source}: ${formatCurrency(lastUpdatedAsset.amount)}`
            : "Add your first asset"}
        </p>
      </div>
    </div>
  );
}
