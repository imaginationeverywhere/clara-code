# Data Visualization Template

**Type:** Animated Data/Charts
**Duration:** 10-30 seconds
**Formats:** Landscape (16:9), Square (1:1)

## Use Cases

- Growth metrics
- Financial reports
- Survey results
- Comparison charts
- Statistics highlights
- Dashboard summaries
- Infographics

## Chart Components

### Animated Counter
```tsx
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number; // in frames
  prefix?: string;
  suffix?: string;
  format?: 'number' | 'currency' | 'percent';
  decimals?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from,
  to,
  duration = 60,
  prefix = '',
  suffix = '',
  format = 'number',
  decimals = 0,
  color = '#FFFFFF',
  size = 'xl',
}) => {
  const frame = useCurrentFrame();

  const value = interpolate(frame, [0, duration], [from, to], {
    extrapolateRight: 'clamp',
  });

  const formatValue = (val: number) => {
    const fixed = val.toFixed(decimals);
    switch (format) {
      case 'currency':
        return `$${parseFloat(fixed).toLocaleString()}`;
      case 'percent':
        return `${fixed}%`;
      default:
        return parseFloat(fixed).toLocaleString();
    }
  };

  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-video-xl',
    xl: 'text-video-2xl',
  };

  return (
    <span className={`${sizeClasses[size]} font-black`} style={{ color }}>
      {prefix}{formatValue(value)}{suffix}
    </span>
  );
};
```

### Progress Bar Chart
```tsx
interface ProgressBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  maxValue?: number;
  showValues?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const ProgressBarChart: React.FC<ProgressBarChartProps> = ({
  data,
  maxValue,
  showValues = true,
  orientation = 'horizontal',
}) => {
  const frame = useCurrentFrame();
  const max = maxValue || Math.max(...data.map(d => d.value));

  if (orientation === 'horizontal') {
    return (
      <div className="flex flex-col gap-6 w-full">
        {data.map((item, index) => {
          const delay = index * 15;
          const barFrame = Math.max(0, frame - delay);
          const widthPercent = interpolate(
            barFrame,
            [0, 45],
            [0, (item.value / max) * 100],
            { extrapolateRight: 'clamp' }
          );

          return (
            <div key={index} className="flex items-center gap-4">
              <span className="text-xl text-gray-300 w-32 text-right">
                {item.label}
              </span>
              <div className="flex-1 h-10 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color || '#3B82F6',
                  }}
                />
              </div>
              {showValues && (
                <span className="text-xl font-bold text-white w-20">
                  {Math.round(item.value * (widthPercent / ((item.value / max) * 100 || 1)))}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical bars
  return (
    <div className="flex items-end justify-center gap-8 h-80">
      {data.map((item, index) => {
        const delay = index * 15;
        const barFrame = Math.max(0, frame - delay);
        const heightPercent = interpolate(
          barFrame,
          [0, 45],
          [0, (item.value / max) * 100],
          { extrapolateRight: 'clamp' }
        );

        return (
          <div key={index} className="flex flex-col items-center gap-2">
            <span className="text-lg font-bold text-white">
              {showValues && Math.round(item.value * (heightPercent / ((item.value / max) * 100 || 1)))}
            </span>
            <div className="w-16 bg-gray-700 rounded-t-lg relative" style={{ height: '100%' }}>
              <div
                className="absolute bottom-0 w-full rounded-t-lg"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: item.color || '#3B82F6',
                }}
              />
            </div>
            <span className="text-sm text-gray-400">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};
```

### Line Chart
```tsx
interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
  showDots?: boolean;
  showArea?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  color = '#3B82F6',
  showDots = true,
  showArea = false,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const chartWidth = width * 0.8;
  const chartHeight = height * 0.5;
  const padding = 60;

  const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
  const minValue = Math.min(...data.map(d => d.value)) * 0.9;

  // Calculate points
  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * (chartWidth - padding * 2),
    y: chartHeight - padding - ((d.value - minValue) / (maxValue - minValue)) * (chartHeight - padding * 2),
  }));

  // Animate line drawing
  const progress = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: 'clamp' });
  const visiblePoints = Math.ceil(points.length * progress);

  // Create path
  const pathD = points
    .slice(0, visiblePoints)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Area path
  const areaD = showArea && visiblePoints > 1
    ? `${pathD} L ${points[visiblePoints - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`
    : '';

  return (
    <svg width={chartWidth} height={chartHeight} className="mx-auto">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
        <line
          key={i}
          x1={padding}
          y1={padding + (chartHeight - padding * 2) * (1 - ratio)}
          x2={chartWidth - padding}
          y2={padding + (chartHeight - padding * 2) * (1 - ratio)}
          stroke="#374151"
          strokeDasharray="5,5"
        />
      ))}

      {/* Area fill */}
      {showArea && (
        <path d={areaD} fill={`${color}20`} />
      )}

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {showDots && points.slice(0, visiblePoints).map((p, i) => {
        const dotFrame = Math.max(0, frame - (i / points.length) * 60);
        const scale = spring({ frame: dotFrame, fps: 30, config: { damping: 12 } });

        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={8 * scale}
            fill={color}
            stroke="white"
            strokeWidth="3"
          />
        );
      })}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={points[i].x}
          y={chartHeight - padding + 30}
          textAnchor="middle"
          fill="#9CA3AF"
          fontSize="14"
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
};
```

### Pie/Donut Chart
```tsx
interface PieChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  type?: 'pie' | 'donut';
  showLabels?: boolean;
  showLegend?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  type = 'donut',
  showLabels = true,
  showLegend = true,
}) => {
  const frame = useCurrentFrame();

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const size = 300;
  const center = size / 2;
  const radius = size * 0.4;
  const innerRadius = type === 'donut' ? radius * 0.6 : 0;

  // Animate reveal
  const animatedAngle = interpolate(frame, [0, 60], [0, 360], {
    extrapolateRight: 'clamp',
  });

  let currentAngle = -90;

  return (
    <div className="flex items-center gap-12">
      <svg width={size} height={size}>
        {data.map((item, index) => {
          const sliceAngle = (item.value / total) * 360;
          const endAngle = Math.min(currentAngle + sliceAngle, -90 + animatedAngle);

          if (currentAngle >= -90 + animatedAngle) return null;

          const startAngleRad = (currentAngle * Math.PI) / 180;
          const endAngleRad = (endAngle * Math.PI) / 180;

          const x1 = center + radius * Math.cos(startAngleRad);
          const y1 = center + radius * Math.sin(startAngleRad);
          const x2 = center + radius * Math.cos(endAngleRad);
          const y2 = center + radius * Math.sin(endAngleRad);

          const ix1 = center + innerRadius * Math.cos(startAngleRad);
          const iy1 = center + innerRadius * Math.sin(startAngleRad);
          const ix2 = center + innerRadius * Math.cos(endAngleRad);
          const iy2 = center + innerRadius * Math.sin(endAngleRad);

          const largeArc = endAngle - currentAngle > 180 ? 1 : 0;

          const pathD = type === 'donut'
            ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`
            : `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

          currentAngle += sliceAngle;

          return (
            <path
              key={index}
              d={pathD}
              fill={item.color}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* Center label for donut */}
        {type === 'donut' && (
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="24"
            fontWeight="bold"
          >
            {total.toLocaleString()}
          </text>
        )}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-col gap-4">
          {data.map((item, index) => {
            const delay = index * 10;
            const legendOpacity = interpolate(
              Math.max(0, frame - delay),
              [0, 15],
              [0, 1],
              { extrapolateRight: 'clamp' }
            );

            return (
              <div
                key={index}
                className="flex items-center gap-3"
                style={{ opacity: legendOpacity }}
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-lg text-white">{item.label}</span>
                <span className="text-lg text-gray-400">
                  ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
```

### Metric Card
```tsx
interface MetricCardProps {
  title: string;
  value: number;
  change?: number; // percentage change
  changeLabel?: string;
  icon?: string;
  format?: 'number' | 'currency' | 'percent';
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  format = 'number',
  color = '#3B82F6',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12 } });

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percent':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <div
      className="bg-gray-800 rounded-2xl p-8 shadow-xl"
      style={{ transform: `scale(${scale})` }}
    >
      <div className="flex items-center gap-4 mb-4">
        {icon && <span className="text-4xl">{icon}</span>}
        <span className="text-xl text-gray-400">{title}</span>
      </div>

      <div className="mb-4">
        <AnimatedCounter
          from={0}
          to={value}
          format={format}
          size="lg"
          color={color}
        />
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2">
          <span
            className={`text-lg font-semibold ${
              change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-500">{changeLabel}</span>
        </div>
      )}
    </div>
  );
};
```

## Complete Data Visualization Composition

```tsx
import { AbsoluteFill, Sequence } from 'remotion';

interface DataVizProps {
  title: string;
  subtitle?: string;
  metrics: Array<{
    title: string;
    value: number;
    change?: number;
    format?: 'number' | 'currency' | 'percent';
    icon?: string;
  }>;
  chartData?: Array<{ label: string; value: number; color?: string }>;
  chartType?: 'bar' | 'line' | 'pie';
  conclusion?: string;
  accentColor?: string;
}

export const DataVisualization: React.FC<DataVizProps> = ({
  title,
  subtitle,
  metrics,
  chartData,
  chartType = 'bar',
  conclusion,
  accentColor = '#3B82F6',
}) => {
  return (
    <AbsoluteFill className="bg-gray-900">
      {/* Title Scene */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill className="flex flex-col items-center justify-center p-16">
          <h1 className="text-video-xl font-bold text-white text-center">{title}</h1>
          {subtitle && (
            <p className="text-video-base text-gray-400 mt-4">{subtitle}</p>
          )}
        </AbsoluteFill>
      </Sequence>

      {/* Metrics Scene */}
      <Sequence from={90} durationInFrames={180}>
        <AbsoluteFill className="flex items-center justify-center gap-8 p-16">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              format={metric.format}
              icon={metric.icon}
              color={accentColor}
            />
          ))}
        </AbsoluteFill>
      </Sequence>

      {/* Chart Scene */}
      {chartData && (
        <Sequence from={270} durationInFrames={240}>
          <AbsoluteFill className="flex items-center justify-center p-16">
            {chartType === 'bar' && (
              <ProgressBarChart data={chartData} />
            )}
            {chartType === 'line' && (
              <LineChart data={chartData} color={accentColor} showArea />
            )}
            {chartType === 'pie' && (
              <PieChart data={chartData.map((d, i) => ({
                ...d,
                color: d.color || [`#3B82F6`, `#10B981`, `#F59E0B`, `#EF4444`, `#8B5CF6`][i % 5],
              }))} />
            )}
          </AbsoluteFill>
        </Sequence>
      )}

      {/* Conclusion Scene */}
      {conclusion && (
        <Sequence from={510}>
          <AbsoluteFill className="flex items-center justify-center p-16">
            <h2 className="text-video-lg font-bold text-white text-center max-w-4xl">
              {conclusion}
            </h2>
          </AbsoluteFill>
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
```

## Example Props

```tsx
const revenueGrowthProps: DataVizProps = {
  title: "Q4 Revenue Report",
  subtitle: "October - December 2025",
  metrics: [
    { title: "Total Revenue", value: 2500000, format: 'currency', change: 32, icon: '💰' },
    { title: "New Customers", value: 12500, format: 'number', change: 18, icon: '👥' },
    { title: "Conversion Rate", value: 4.8, format: 'percent', change: 12, icon: '📈' },
  ],
  chartData: [
    { label: 'Oct', value: 750000 },
    { label: 'Nov', value: 820000 },
    { label: 'Dec', value: 930000 },
  ],
  chartType: 'line',
  conclusion: "32% YoY growth - our best quarter ever!",
  accentColor: '#10B981',
};
```

## Color Palettes for Data

| Type | Primary | Secondary | Tertiary | Quaternary |
|------|---------|-----------|----------|------------|
| Growth | #10B981 | #34D399 | #6EE7B7 | #A7F3D0 |
| Revenue | #3B82F6 | #60A5FA | #93C5FD | #BFDBFE |
| Warning | #F59E0B | #FBBF24 | #FCD34D | #FDE68A |
| Danger | #EF4444 | #F87171 | #FCA5A5 | #FECACA |
| Neutral | #6B7280 | #9CA3AF | #D1D5DB | #E5E7EB |
