import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { EnergyData } from '../types/energy';
import { getHourlyForDay, getWeeklyChartData } from '../utils/dataProcessing';
import { useMemo } from 'react';
import { APP_CONSUMPTION_COLOR, APP_SOLAR_COLOR, APP_TEXT_COLOR } from '../App';

export interface EnergyChartProps {
  data: EnergyData;
  keys: string[];
  dailyConsumption: Map<string, number>;
  dailyGenerations: Map<string, number>;
  weeklyConsumption: Map<string, number>;
  grouping: 'daily' | 'weekly';
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
}

export default function EnergyChart(props: EnergyChartProps) {
  const { data, keys, dailyConsumption, dailyGenerations, grouping, currentIndex } = props;
  const currentKey = keys[currentIndex];
  if (!currentKey) return null;

  const chartData = useMemo(() => {
    if (grouping === 'daily') {
      return getHourlyForDay(data, parseISO(currentKey));
    }
    return getWeeklyChartData(parseISO(currentKey), dailyConsumption, dailyGenerations);
  }, [currentKey, grouping, data, dailyConsumption, dailyGenerations]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Energy Usage</h3>
      <div className="h-96 lg:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey={grouping === 'daily' ? 'hour' : 'day'}
              tickFormatter={grouping === 'daily' ? (hour) => format(new Date(2000, 0, 1, hour), 'ha') : undefined}
              interval={grouping === 'weekly' ? 0 : 2}
              axisLine={false}
              tick={{ fill: APP_TEXT_COLOR, fontSize: 12 }}
            />

            <YAxis
              domain={[-'auto', 'auto']} // Allow negative
              tickFormatter={(v) => Math.abs(v).toFixed(1)}
              axisLine={false}
              tick={{ fill: APP_TEXT_COLOR, fontSize: 12 }}
              width={50}
              label={{
                value: 'kWh',
                angle: -90,
                position: 'insideLeft',
                style: { fill: APP_TEXT_COLOR, fontSize: 12 },
              }}
            />

            <ReferenceLine y={0} stroke={APP_TEXT_COLOR} strokeDasharray="3 3" />
            {/* Need to customize Tooltip for differentiating styling for +/- */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value as number;
                  const abs = Math.abs(value).toFixed(1);
                  const isNegative = value < 0;

                  return (
                    <div
                      style={{
                        backgroundColor: 'white',
                        padding: '0 18px 16px 18px',
                        border: 'none',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        fontSize: 14,
                      }}
                    >
                      <p>
                        <strong>{label}</strong>
                      </p>
                      <p style={{ color: isNegative ? APP_SOLAR_COLOR : APP_CONSUMPTION_COLOR }}>
                        <strong>
                          {isNegative ? '↓' : '↑'} {abs} kWh
                        </strong>
                        <span style={{ marginLeft: '8px' }}>{isNegative ? 'Energy Consumed' : 'Energy Generated'}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="netConsumption"
              fill="#3b82f6" // Default color
              stroke="none"
              radius={[4, 4, 4, 4]}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
