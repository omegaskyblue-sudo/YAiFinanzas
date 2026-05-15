import { View, Text } from "react-native";
import Svg, { Rect, Line, G, Text as SvgText } from "react-native-svg";

interface Bar {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: Bar[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}

export default function BarChart({
  data,
  height = 160,
  color = "#4F46E5",
  formatValue = (v) => `$${v}`,
}: Props) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.max(24, Math.min(48, 300 / data.length - 8));
  const chartWidth = Math.max(300, data.length * (barWidth + 8));
  const padding = { top: 16, bottom: 24, left: 0, right: 0 };
  const innerH = height - padding.top - padding.bottom;

  return (
    <View className="items-center">
      <Svg width={chartWidth} height={height}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = padding.top + innerH * (1 - frac);
          return (
            <G key={frac}>
              <Line
                x1={0}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth={1}
              />
              <SvgText
                x={4}
                y={y + 4}
                fill="#9CA3AF"
                fontSize={10}
              >
                {formatValue(max * frac)}
              </SvgText>
            </G>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.value / max) * innerH;
          const x = i * (barWidth + 8) + padding.left;
          const y = padding.top + innerH - barH;
          return (
            <G key={i}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 1)}
                rx={4}
                fill={d.color ?? color}
                opacity={0.85}
              />
              <SvgText
                x={x + barWidth / 2}
                y={padding.top + innerH + 14}
                fill="#6B7280"
                fontSize={10}
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
