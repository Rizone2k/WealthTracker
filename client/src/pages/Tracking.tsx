
import { useQuery } from "@tanstack/react-query";
import { Asset } from "@shared/schema";
import Layout from "@/components/Layout";
import AssetTracking from "@/components/AssetTracking";

export default function Tracking() {
  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Tracking</h1>
          <p className="text-gray-500">Track your assets over time</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <AssetTracking assets={assets} />
      </div>
    </Layout>
  );
}
