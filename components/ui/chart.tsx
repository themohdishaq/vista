// filepath: components/ui/chart.tsx
'use client';

import * as React from 'react';
import { ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

interface ChartContextProps {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextProps | null>(null);

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactElement;
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ id, className, children, config, ...props }, ref) => {
    const generatedId = React.useId();
    const chartId = `chart-${id || generatedId.replace(/:/g, '')}`;

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          data-chart={chartId}
          ref={ref}
          className={cn('flex aspect-video justify-center text-xs', className)}
          {...props}
        >
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = 'ChartContainer';

export const ChartTooltip = Tooltip;

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    dataKey?: string;
    color?: string;
    payload?: { fill?: string };
  }>;
  label?: string | number;
  className?: string;
  hideLabel?: boolean;
  indicator?: 'dot' | 'line';
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  hideLabel = false,
  indicator = 'dot',
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs shadow-xl',
        className
      )}
    >
      {!hideLabel && label && (
        <div className="mb-1.5 font-semibold text-slate-800">{label}</div>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const configKey = entry.name || (entry.dataKey as string) || 'value';
          const itemConfig = config[configKey];
          const color = entry.color || entry.payload?.fill || '#008a90';

          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                {indicator === 'dot' && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span className="text-slate-500 font-medium">
                  {itemConfig?.label || entry.name || configKey}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900">
                {typeof entry.value === 'number'
                  ? entry.value.toLocaleString()
                  : entry.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
