
import { Asset } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useState } from "react";

interface ActivityHistoryProps {
  assets: Asset[];
}

export default function ActivityHistory({ assets }: ActivityHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Sort assets by updated date (newest first)
  const sortedAssets = [...assets].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssets = sortedAssets.slice(startIndex, endIndex);

  const getActivityIcon = (movement: number) => {
    if (movement > 0) {
      return (
        <div className="bg-green-100 rounded-full p-2 mr-3">
          <TrendingUp className="h-4 w-4 text-green-500" />
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

  const getActivityDescription = (asset: Asset) => {
    return `Added to ${asset.source}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Activity History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentAssets.map((asset) => (
            <div key={asset.id} className="flex items-start">
              {getActivityIcon(asset.amount)}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {getActivityDescription(asset)}
                </p>
                {asset.description && (
                  <p className="text-xs text-gray-600 italic">
                    "{asset.description}"
                  </p>
                )}
                <p className="text-xs text-gray-500">{formatDate(asset.updatedAt)}</p>
              </div>
              <p className="text-sm font-medium text-green-500">
                +{formatCurrency(asset.amount)}
              </p>
            </div>
          ))}

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
