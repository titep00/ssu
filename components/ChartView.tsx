"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  PieController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import type { ChartType } from "@/lib/types";

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  PieController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
);

const whiteBackgroundPlugin = {
  id: "whiteBackground",
  beforeDraw(chart: Chart) {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  },
};

const PALETTE = [
  "#0d9488",
  "#0ea5e9",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#10b981",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];

export type ChartHandle = {
  toPng: () => string | null;
};

type Props = {
  type: ChartType;
  labels: string[];
  values: number[];
  title: string;
  valueLabel: string;
};

export const ChartView = forwardRef<ChartHandle, Props>(function ChartView(
  { type, labels, values, title, valueLabel },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useImperativeHandle(ref, () => ({
    toPng: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL("image/png");
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    chartRef.current?.destroy();

    const colors = labels.map((_, i) => PALETTE[i % PALETTE.length]);
    const isCircular = type === "pie";

    chartRef.current = new Chart(canvas, {
      type,
      plugins: [whiteBackgroundPlugin],
      data: {
        labels,
        datasets: [
          {
            label: valueLabel,
            data: values,
            backgroundColor: isCircular
              ? colors
              : type === "line"
                ? "rgba(13,148,136,0.15)"
                : "#0d9488",
            borderColor: type === "line" ? "#0d9488" : colors,
            borderWidth: type === "line" ? 2 : 1,
            fill: type === "line",
            tension: 0.3,
            pointBackgroundColor: "#0d9488",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          title: {
            display: Boolean(title),
            text: title,
            font: { size: 16, weight: 600 },
            color: "#18181b",
            padding: { bottom: 12 },
          },
          legend: {
            display: isCircular,
            position: "bottom",
          },
        },
        scales: isCircular
          ? {}
          : {
              x: { ticks: { color: "#52525b" }, grid: { display: false } },
              y: {
                beginAtZero: true,
                ticks: { color: "#52525b" },
                grid: { color: "rgba(0,0,0,0.06)" },
              },
            },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [type, labels, values, title, valueLabel]);

  return (
    <div className="relative h-72 w-full rounded-lg bg-white p-2 sm:h-80">
      <canvas ref={canvasRef} />
    </div>
  );
});
