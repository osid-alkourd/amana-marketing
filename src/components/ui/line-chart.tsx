"use client";

interface LineChartDataPoint {
  label: string;   // اسم النقطة (مثلاً الأسبوع)
  value: number;   // القيمة (مثلاً الإيرادات)
  color?: string;  // لون الخط
}

interface LineChartProps {
  title: string;
  data: LineChartDataPoint[];
  className?: string;
  height?: number;
  showValues?: boolean;
  formatValue?: (value: number) => string;
}

export function LineChart({
  title,
  data,
  className = "",
  height = 300,
  showValues = true,
  formatValue = (value) => value.toLocaleString(),
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value));
  const colors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1",
  ];

  // Normalize points for SVG
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = maxValue > 0 ? 100 - (item.value / maxValue) * 100 : 100;
    return { x, y, label: item.label, value: item.value, color: item.color || colors[index % colors.length] };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>

      <div className="relative" style={{ height: `${height}px` }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              x2="100"
              y1={100 - ratio * 100}
              y2={100 - ratio * 100}
              stroke="gray"
              strokeWidth="0.3"
              opacity="0.3"
            />
          ))}

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth="1.5" />

          {/* Dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.5"
              fill={p.color}
            />
          ))}
        </svg>

        {/* Labels under X axis */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-400 px-1">
          {points.map((p, i) => (
            <span key={i} className="truncate w-10 text-center">
              {p.label}
            </span>
          ))}
        </div>

        {/* Values above points */}
        {showValues && (
          <div className="absolute inset-0">
            {points.map((p, i) => (
              <div
                key={i}
                className="absolute text-[10px] text-gray-300"
                style={{
                  left: `${p.x}%`,
                  bottom: `${100 - p.y}%`,
                  transform: "translate(-50%, -120%)",
                }}
              >
                {formatValue(p.value)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
