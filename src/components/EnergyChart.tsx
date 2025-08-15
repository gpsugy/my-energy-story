// EnergyChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, parseISO, isSameDay, addDays, subDays } from 'date-fns';
import { EnergyData } from '../types/energy';

interface EnergyChartProps {
  data: EnergyData;
  targetDate: Date | null;
  onPrevDay: () => void;
  onNextDay: () => void;
}

// Normalize Wh → kWh
const normalizeValue = (val: number) => (val > 100 ? val / 1000 : val);

export default function EnergyChart({ data, targetDate, onPrevDay, onNextDay }: EnergyChartProps) {
  if (!targetDate) return null;

  // Filter to target day
  const dayData = data.filter((interval) => {
    const date = typeof interval.datetime === 'string' ? parseISO(interval.datetime) : interval.datetime;
    return date && !isNaN(date.getTime()) && isSameDay(date, targetDate);
  });

  // Aggregate by hour (0–23)
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    let consumption = 0;
    let generation = 0;

    dayData.forEach((interval) => {
      let date: Date;

      if (typeof interval.datetime === 'string') {
        date = parseISO(interval.datetime);
      } else {
        date = interval.datetime;
      }

      if (!date || isNaN(date.getTime())) return;

      if (date.getHours() === hour) {
        consumption += normalizeValue(interval.consumption);
        generation += normalizeValue(interval.generation);
      }
    });

    return {
      hour,
      consumption: Math.max(0, consumption),
      generation: Math.max(0, generation),
      // Later: net = consumption - generation
    };
  });

  // Only show hours with data (or keep all for full day)
  const hasData = (d: any) => d.consumption > 0;
  const chartData = hourlyData.some(hasData) ? hourlyData : hourlyData.slice(0, 8);

  // Format date for display
  const displayDate = format(targetDate, 'MMM d, yyyy');

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevDay}
          className="text-xl font-bold text-gray-700 hover:text-gray-900"
          disabled={!targetDate}
        >
          ←
        </button>
        <h3 className="text-lg font-semibold">{displayDate}</h3>
        <button
          onClick={onNextDay}
          className="text-xl font-bold text-gray-700 hover:text-gray-900"
          disabled={!targetDate}
        >
          →
        </button>
      </div>

      <div className="h-80">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tickFormatter={(hour) => format(new Date(2000, 0, 1, hour), 'h a')}
              interval={0}
              minTickGap={10}
            />
            <YAxis
              label={{ value: 'kWh', angle: -90, position: 'insideLeft', offset: -10 }}
              tickFormatter={(v) => `${v}k`}
            />
            <Tooltip
              formatter={(value, name) => [
                `${value.toFixed(2)} kWh`,
                name === 'consumption' ? 'Consumption' : 'Generation',
              ]}
              labelFormatter={(label) => {
                return `Hour: ${format(new Date(2000, 0, 1, Number(label)), 'h a')}`;
              }}
            />
            {/* Only consumption now */}
            <Bar dataKey="consumption" fill="#3b82f6" name="Consumption`" />
            {/* Later: add generation as stacked bar */}
            {/* <Bar dataKey="generation" fill="#16a34a" name="Generation" stackId="a" /> */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
