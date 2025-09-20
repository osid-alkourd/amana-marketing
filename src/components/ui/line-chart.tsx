"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

interface LineChartProps {
  data: any[];
  lines: {
    dataKey: string;
    stroke: string;
    name: string;
  }[];
  xAxisDataKey: string;
  title: string;
  yAxisLabel?: string;
  formatTooltip?: (value: ValueType) => string;
}

// ✅ Fixed CustomTooltip with correct typings
const CustomTooltip = ({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: {
    name: string;
    value: ValueType;
    color?: string;
  }[];
  label?: NameType;
  formatter?: (value: ValueType) => string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
        <p className="label text-white font-bold">{`${label}`}</p>
        {payload.map((p, index) => (
          <p key={index} style={{ color: p.color }} className="intro">
            {`${p.name}: ${formatter ? formatter(p.value) : p.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export function LineChart({
  data,
  lines,
  xAxisDataKey,
  title,
  yAxisLabel,
  formatTooltip,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
        <XAxis dataKey={xAxisDataKey} stroke="#A0AEC0" />
        <YAxis
          stroke="#A0AEC0"
          label={{
            value: yAxisLabel,
            angle: -90,
            position: "insideLeft",
            fill: "#A0AEC0",
          }}
        />
        <Tooltip
          content={
            <CustomTooltip formatter={formatTooltip} />
          }
          cursor={{
            stroke: "#A0AEC0",
            strokeWidth: 1,
            strokeDasharray: "3 3",
          }}
        />
        <Legend
          wrapperStyle={{
            color: "#A0AEC0",
            paddingTop: "20px",
          }}
        />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            name={line.name}
            dot={false}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
