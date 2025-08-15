// EnergyChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, isSameDay } from 'date-fns';
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
  if (!targetDate) {
    return null;
  }

  // Filter to target day
  const dayData = data.filter((interval) => isSameDay(interval.datetime, targetDate));

  // Aggregate by hour (0–23)
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    let consumption = 0;
    let generation = 0;

    dayData.forEach((interval) => {
      if (interval.datetime.getHours() === hour) {
        consumption += normalizeValue(interval.consumption);
        generation += normalizeValue(interval.generation);
      }
    });

    return {
      hour,
      consumption: Math.max(0, consumption),
      generation: Math.max(0, generation),
      // TODO: net = consumption - generation
    };
  });

  // Only show hours with data (or keep all for full day)
  const hasData = (d: any) => d.consumption > 0;
  const chartData = hourlyData.some(hasData) ? hourlyData : hourlyData.slice(0, 8);
  const displayDate = format(targetDate, 'MMM d, yyyy');

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrevDay}
          className="text-2xl text-gray-500 hover:text-gray-700 transition-colors"
          disabled={!targetDate}
        >
          ←
        </button>
        <h3 className="text-xl font-semibold text-gray-800">{displayDate}</h3>
        <button
          onClick={onNextDay}
          className="text-2xl text-gray-500 hover:text-gray-700 transition-colors"
          disabled={!targetDate}
        >
          →
        </button>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly usage</h3>
      <div className="h-96">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="hour"
              tickFormatter={(hour) => format(new Date(2000, 0, 1, hour), 'ha')}
              interval={2} // Show every 3rd hour text (for cleanliness)
              axisLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(v) => `${v}`}
              axisLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              width={50}
              label={{
                value: 'kWh',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#6B7280', fontSize: 12 },
              }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)} kWh`, 'Consumption']}
              labelFormatter={(hour) => format(new Date(2000, 0, 1, Number(hour)), 'h:mm a')}
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            />
            <Bar
              dataKey="consumption"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              style={{ fill: '#3b82f6' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
