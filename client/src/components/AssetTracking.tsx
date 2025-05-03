
import { Asset } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartComponent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

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
    values: sortedMonths.map(month => monthlyTotals[month]),
    colors: ['#3B82F6'] // Use blue color for the line
  };

  // Custom chart options for line chart
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => formatCurrency(value)
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      line: {
        tension: 0.4, // Makes the line smooth
        borderWidth: 2,
        fill: 'start',
        backgroundColor: 'rgba(59, 130, 246, 0.1)' // Light blue background
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 6,
        backgroundColor: '#3B82F6'
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return formatCurrency(context.raw);
          }
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Tracking</CardTitle>
        <CardDescription>Track your total assets over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartComponent 
            data={chartData} 
            type="line" 
            options={options}
            height={300}
            width={600}
          />
        </div>
      </CardContent>
    </Card>
  );
}
