import { Asset } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartComponent } from "@/components/ui/chart";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { useState } from "react";

interface AssetTrackingProps {
  assets: Asset[];
}

export default function AssetTracking({ assets }: AssetTrackingProps) {
  // Group assets by month and calculate total for each month
  const monthlyTotals = assets.reduce((acc, asset) => {
    if (!asset.month) return acc;

    const monthKey = new Date(asset.month).toISOString().slice(0, 7); // Format: YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = 0;
    }
    acc[monthKey] += asset.amount;
    return acc;
  }, {} as Record<string, number>);

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyTotals).sort();

  // Prepare chart data
  const chartData = {
    labels: sortedMonths.map(month => {
      const date = new Date(month);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [{
      data: sortedMonths.map(month => monthlyTotals[month]),
      borderColor: '#FFD700',
      borderWidth: 2,
      tension: 0.4,
      fill: false
    }]
  };

  // Custom chart options for line chart
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => formatCurrency(context.raw)
        }
      }
    }
  };

  const [selectedMonth, setSelectedMonth] = useState(sortedMonths[sortedMonths.length - 1] || '');

  // Get assets for selected month
  const monthlyAssets = assets.filter(asset => {
    if (!asset.month) return false;
    const assetMonth = new Date(asset.month).toISOString().slice(0, 7);
    return assetMonth === selectedMonth;
  });

  // Calculate total for selected month
  const monthlyTotal = monthlyAssets.reduce((sum, asset) => sum + asset.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Tracking</CardTitle>
        <CardDescription>Track your total assets over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mb-6">
          <ChartComponent 
            data={chartData} 
            type="line" 
            options={options}
            height={300}
            width={600}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Select 
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {sortedMonths.map(month => (
                  <SelectItem key={month} value={month}>
                    {new Date(month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Assets</p>
              <p className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</p>
            </div>
          </div>

          <div className="space-y-2">
            {monthlyAssets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{asset.source}</p>
                  <p className="text-sm text-gray-500">{asset.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(asset.amount)}</p>
                  <p className="text-sm text-gray-500">
                    {formatPercentage(asset.amount, monthlyTotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}