import { Asset } from "@shared/schema";
import { Banknote, Wallet, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface MetricsOverviewProps {
  assets: Asset[];
}

export default function MetricsOverview({ assets }: MetricsOverviewProps) {
  // Calculate total assets
  const totalAmount = assets.reduce((sum, asset) => sum + asset.amount, 0);

  // Get count of unique asset sources
  const uniqueSources = new Set(assets.map(asset => asset.source)).size;

  // Get last updated asset
  const lastUpdatedAsset = assets.length > 0 
    ? assets.reduce((latest, asset) => {
        const latestDate = new Date(latest.updatedAt);
        const currentDate = new Date(asset.updatedAt);
        return currentDate > latestDate ? asset : latest;
      })
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-500 text-sm font-medium">Total Assets</h3>
          <div className="bg-blue-100 rounded-full p-2">
            <Wallet className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
        <p className="mt-2 text-sm text-green-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12 7a1 1 0 01-1-1V5H9a1 1 0 110-2h2a1 1 0 011 1v1h1a1 1 0 110 2h-1zm-6 6a1 1 0 001 1h6a1 1 0 100-2H7a1 1 0 00-1 1z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M5 5a1 1 0 00-1 1v4a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1H5zm0 2h10v2H5V7z" clipRule="evenodd" />
          </svg>
          <span>Total across {assets.length} assets</span>
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
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
