import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { EnergyData } from '../types/energy';
import { getHourlyForDay } from '../utils/dataProcessing';

interface EnergyChartProps {
  data: EnergyData;
  // dailyKeys or weeklyKeys
  keys: string[];
  dailyTotals: Map<string, number>;
  weeklyTotals: Map<string, number>;
  grouping: 'daily' | 'weekly';
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
}

export default function EnergyChart({
  data,
  keys,
  dailyTotals,
  weeklyTotals,
  grouping,
  currentIndex,
  onPrev,
  onNext,
  isPrevDisabled,
  isNextDisabled,
}: EnergyChartProps) {
  const currentKey = keys[currentIndex];
  if (!currentKey) return null;

  const displayDate =
    grouping === 'daily'
      ? format(parseISO(currentKey), 'MMM d, yyyy')
      : (() => {
          const start = parseISO(currentKey);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
        })();

  // Chart data
  let chartData;
  let xAxisLabel;

  if (grouping === 'daily') {
    const targetDate = parseISO(currentKey);
    chartData = getHourlyForDay(data, targetDate);
    xAxisLabel = 'Hour';
  } else {
    const weekStart = parseISO(currentKey);
    chartData = [];
    // Weekly view: show 7 days/bars
    for (let i = 0; i < 7; i++) {
      // weeklyKeys are keyed by the start of the week (Monday)
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const consumption = dailyTotals.get(dateKey) || 0;
      chartData.push({
        day: format(date, 'EEE'),
        consumption,
      });
    }
    xAxisLabel = 'Day';
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrev}
          disabled={isPrevDisabled}
          className={`text-2xl transition-colors ${
            isPrevDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ←
        </button>
        <h3 className="text-xl font-semibold text-gray-800">{displayDate}</h3>
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className={`text-2xl transition-colors ${
            isNextDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          →
        </button>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {grouping === 'daily' ? 'Hourly usage' : 'Daily usage'}
      </h3>
      <div className="h-96">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey={grouping === 'daily' ? 'hour' : 'day'}
              tickFormatter={grouping === 'daily' ? (hour) => format(new Date(2000, 0, 1, hour), 'ha') : undefined}
              interval={grouping === 'weekly' ? 0 : 2}
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
              labelFormatter={
                grouping === 'daily' ? (hour) => format(new Date(2000, 0, 1, Number(hour)), 'h:mm a') : undefined
              }
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            />
            <Bar dataKey="consumption" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
