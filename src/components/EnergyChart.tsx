import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { EnergyData } from '../types/energy';
import { getHourlyForDay } from '../utils/dataProcessing';

interface EnergyChartProps {
  data: EnergyData;
  dailyKeys: string[];
  currentIndex: number;
  onPrevDay: () => void;
  onNextDay: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
}

export default function EnergyChart({
  data,
  dailyKeys,
  currentIndex,
  onPrevDay,
  onNextDay,
  isPrevDisabled,
  isNextDisabled,
}: EnergyChartProps) {
  const currentKey = dailyKeys[currentIndex];
  if (!currentKey) return null;

  const targetDate = parseISO(currentKey);
  const displayDate = format(targetDate, 'MMM d, yyyy');
  const hourlyData = getHourlyForDay(data, targetDate);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrevDay}
          disabled={isPrevDisabled}
          className={`text-2xl transition-colors ${
            isPrevDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ←
        </button>
        <h3 className="text-xl font-semibold text-gray-800">{displayDate}</h3>
        <button
          onClick={onNextDay}
          disabled={isNextDisabled}
          className={`text-2xl transition-colors ${
            isNextDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          →
        </button>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly usage</h3>
      <div className="h-96">
        <ResponsiveContainer>
          <BarChart data={hourlyData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="hour"
              tickFormatter={(hour) => format(new Date(2000, 0, 1, hour), 'ha')}
              interval={2}
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
            <Bar dataKey="consumption" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
