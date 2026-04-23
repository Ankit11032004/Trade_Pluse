import React, { useMemo } from 'react';

const COLORS = [
  '#6366f1', // indigo
  '#22d3ee', // cyan
  '#f59e0b', // amber
  '#10b981', // emerald
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#3b82f6', // blue
  '#84cc16', // lime
  '#ec4899', // pink
  '#14b8a6', // teal
];

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function donutSlicePath(cx, cy, outerR, innerR, startAngle, endAngle) {
  const o1 = polarToCartesian(cx, cy, outerR, startAngle);
  const o2 = polarToCartesian(cx, cy, outerR, endAngle);
  const i1 = polarToCartesian(cx, cy, innerR, endAngle);
  const i2 = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

function AllocationChart({ portfolio }) {
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  // Build slices from portfolio current value
  const slices = useMemo(() => {
    const filtered = portfolio.filter(
      (item) => Number(item.total_qty) > 0 && Number(item.current_price) > 0
    );
    const total = filtered.reduce(
      (acc, item) => acc + Number(item.total_qty) * Number(item.current_price),
      0
    );
    if (total === 0) return [];

    let cumAngle = 0;
    return filtered.map((item, i) => {
      const value = Number(item.total_qty) * Number(item.current_price);
      const pct   = value / total;
      const sweep = pct * 360;
      const start = cumAngle;
      const end   = cumAngle + sweep;
      cumAngle    = end;

      return {
        ticker : item.stock_ticker,
        value,
        pct,
        start,
        end,
        color  : COLORS[i % COLORS.length],
      };
    });
  }, [portfolio]);

  // Empty state
  if (slices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-300">
        <p className="text-4xl mb-2">🥧</p>
        <p className="text-sm text-gray-400">No data to display</p>
      </div>
    );
  }

  const cx = 80, cy = 80, outerR = 70, innerR = 42;
  const hovered = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="flex items-center gap-6 flex-wrap">

      {/* Donut SVG */}
      <div className="relative shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {slices.map((slice, i) => {
            const isHovered = hoveredIndex === i;
            // Slightly expand hovered slice outward
            const nudge = isHovered ? 5 : 0;
            const mid   = (slice.start + slice.end) / 2;
            const rad   = ((mid - 90) * Math.PI) / 180;
            const tx    = Math.cos(rad) * nudge;
            const ty    = Math.sin(rad) * nudge;

            return (
              <path
                key={slice.ticker}
                d={donutSlicePath(cx, cy, outerR, innerR, slice.start, slice.end)}
                fill={slice.color}
                opacity={hoveredIndex !== null && !isHovered ? 0.45 : 1}
                transform={`translate(${tx}, ${ty})`}
                style={{ transition: 'opacity 0.2s, transform 0.2s' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
            );
          })}

          {/* Centre label */}
          <text
            x={cx} y={cy - 8}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#1f2937"
          >
            {hovered ? hovered.ticker : `${slices.length}`}
          </text>
          <text
            x={cx} y={cy + 8}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
          >
            {hovered
              ? `${(hovered.pct * 100).toFixed(1)}%`
              : 'holdings'}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <ul className="flex flex-col gap-2 min-w-0 flex-1">
        {slices.map((slice, i) => (
          <li
            key={slice.ticker}
            className="flex items-center gap-2 cursor-pointer group"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Color dot */}
            <span
              className="shrink-0 w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125"
              style={{ backgroundColor: slice.color }}
            />
            {/* Ticker */}
            <span className="text-sm font-semibold text-gray-800 min-w-[100px]">
              {""+slice.ticker+" "}
            </span>
            {/* Bar */}
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width           : `${(slice.pct * 100).toFixed(1)}%`,
                  backgroundColor : slice.color,
                  opacity         : hoveredIndex !== null && hoveredIndex !== i ? 0.35 : 1,
                }}
              />
            </div>
            {/* Percent */}
           <span className="min-w-[100px] text-xl font-medium text-gray-500 text-right tracking-wide">
  {" =   "+(slice.pct * 100).toFixed(1)+"%  "}
</span>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default AllocationChart;