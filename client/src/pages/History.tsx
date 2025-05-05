
import { useQuery } from "@tanstack/react-query";
import { Asset } from "@shared/schema";
import Layout from "@/components/Layout";
import ActivityHistory from "@/components/ActivityHistory";

export default function History() {
  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <p className="text-gray-500">View all your asset activities</p>
        </div>
      </div>
      <ActivityHistory assets={assets} />
    </Layout>
  );
}
