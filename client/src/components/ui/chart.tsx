"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { ASSET_SOURCE_COLORS } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

interface ChartProps {
  data: ChartData;
  type: "pie" | "doughnut" | "bar" | "line";
  options?: any;
  height?: number;
  width?: number;
}

export function ChartComponent({
  data,
  type,
  options,
  height = 250,
  width = 250,
}: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const colors = data.colors || 
      data.labels.map(label => ASSET_SOURCE_COLORS[label] || "#" + Math.floor(Math.random() * 16777215).toString(16));

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              let label = context.label || "";
              let value = context.raw || 0;
              return `${label}: ${formatCurrency(value)}`;
            },
          },
        },
      },
    };

    chartInstance.current = new Chart(ctx, {
      type,
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.values,
            backgroundColor: colors,
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: { ...defaultOptions, ...options },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type, options]);

  return <canvas ref={chartRef} height={height} width={width}></canvas>;
}
