import { Asset, ASSET_SOURCE_COLORS } from "@shared/schema"; // Import ASSET_SOURCE_COLORS
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartComponent } from "@/components/ui/chart";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { useState } from "react";

interface AssetTrackingProps {
  assets: Asset[];
}

export default function AssetTracking({ assets }: AssetTrackingProps) {
  // Group assets by month and source
  const monthlySourceTotals = assets.reduce((acc, asset) => {
    if (!asset.month) return acc;

    const monthKey = new Date(asset.month).toISOString().slice(0, 7); // Format: YYYY-MM
    const source = asset.source;

    if (!acc[monthKey]) {
      acc[monthKey] = {};
    }
    if (!acc[monthKey][source]) {
      acc[monthKey][source] = 0;
    }
    acc[monthKey][source] += asset.amount;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlySourceTotals).sort();

  // Get unique sources
  const uniqueSources = Array.from(new Set(assets.map((asset) => asset.source)));

  // Generate colors for sources that don't have predefined colors
  const sourceColors = uniqueSources.reduce((acc, source, index) => {
    acc[source] = ASSET_SOURCE_COLORS[source] || `hsl(${index * 360 / uniqueSources.length}, 70%, 50%)`;
    return acc;
  }, {} as Record<string, string>);

  // Prepare chart data
  const chartData = {
    labels: sortedMonths.map((month) => {
      const date = new Date(month);
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }),
    datasets: uniqueSources.map((source, index) => ({
      label: source,
      data: sortedMonths.map((month) => monthlySourceTotals[month]?.[source] || 0),
      borderColor: sourceColors[source],
      backgroundColor: sourceColors[source],
    })),
  };


  // Custom chart options for line chart
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => formatCurrency(value),
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4, // Makes the line smooth
        borderWidth: 2,
        fill: "start",
        backgroundColor: "rgba(59, 130, 246, 0.1)", // Light blue background
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 6,
        backgroundColor: "#3B82F6",
      },
    },
    plugins: {
      legend: {
        display: true, // Show legend
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          },
        },
      },
    },
  };

  const [selectedMonth, setSelectedMonth] = useState(
    sortedMonths[sortedMonths.length - 1] || "",
  );

  // Get assets for selected month
  const monthlyAssets = assets.filter((asset) => {
    if (!asset.month) return false;
    const assetMonth = new Date(asset.month).toISOString().slice(0, 7);
    return assetMonth === selectedMonth;
  });

  // Calculate total for selected month
  const monthlyTotal = monthlyAssets.reduce(
    (sum, asset) => sum + asset.amount,
    0,
  );

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
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {sortedMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {new Date(month).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Assets</p>
              <p className="text-2xl font-bold">
                {formatCurrency(monthlyTotal)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {monthlyAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
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