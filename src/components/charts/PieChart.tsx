import { View, Text } from "react-native";
import Svg, { Path, G } from "react-native-svg";

interface Slice {
  label: string;
  value: number;
  color: string;
  icon?: string;
}

interface Props {
  data: Slice[];
  size?: number;
  innerRadius?: number;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    "M",
    cx,
    cy,
    "L",
    start.x,
    start.y,
    "A",
    r,
    r,
    0,
    largeArc,
    0,
    end.x,
    end.y,
    "Z",
  ].join(" ");
}

export default function PieChart({ data, size = 180, innerRadius = 0 }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const innerR = innerRadius > 0 ? innerRadius : 0;

  let currentAngle = 0;
  const slices = data.map((slice) => {
    const sliceAngle = (slice.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    let path: string;

    if (innerR > 0) {
      const outerStart = polarToCartesian(cx, cy, r, endAngle);
      const outerEnd = polarToCartesian(cx, cy, r, startAngle);
      const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
      const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
      const largeArc = sliceAngle > 180 ? 1 : 0;

      path = [
        "M",
        outerStart.x,
        outerStart.y,
        "A",
        r,
        r,
        0,
        largeArc,
        0,
        outerEnd.x,
        outerEnd.y,
        "L",
        innerStart.x,
        innerStart.y,
        "A",
        innerR,
        innerR,
        0,
        largeArc,
        1,
        innerEnd.x,
        innerEnd.y,
        "Z",
      ].join(" ");
    } else {
      path = describeArc(cx, cy, r, startAngle, endAngle);
    }

    return { ...slice, path };
  });

  return (
    <View className="items-center">
      <Svg width={size} height={size}>
        <G>
          {slices.map((slice, i) => (
            <Path
              key={i}
              d={slice.path}
              fill={slice.color}
              opacity={0.85}
            />
          ))}
          {innerRadius > 0 && (
            <Path
              d={describeArc(cx, cy, innerRadius, 0, 360)}
              fill="white"
            />
          )}
        </G>
      </Svg>

      <View className="flex-row flex-wrap justify-center mt-4 gap-x-4 gap-y-2">
        {data.map((d, i) => (
          <View key={i} className="flex-row items-center">
            <View
              className="w-3 h-3 rounded-full mr-1.5"
              style={{ backgroundColor: d.color }}
            />
            <Text className="text-gray-600 text-xs">
              {d.icon ?? ""} {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
