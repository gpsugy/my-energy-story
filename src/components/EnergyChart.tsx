import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { EnergyChartProps } from '../types/energy';
import { getHourlyForDay, getDisplayDate, getWeeklyChartData } from '../utils/dataProcessing';
import { useMemo } from 'react';

export default function EnergyChart(props: EnergyChartProps) {
  const { data, keys, dailyTotals, grouping, currentIndex, onPrev, onNext, isPrevDisabled, isNextDisabled } = props;
  const currentKey = keys[currentIndex];
  if (!currentKey) return null;

  const displayDate = useMemo(() => getDisplayDate(currentKey, grouping), [currentKey, grouping]);

  const chartData = useMemo(() => {
    if (grouping === 'daily') {
      return getHourlyForDay(data, parseISO(currentKey));
    }
    return getWeeklyChartData(parseISO(currentKey), dailyTotals);
  }, [currentKey, grouping, data, dailyTotals]);

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
