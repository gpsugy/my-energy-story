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
    <div className="energy-chart-container">
      <h3 className="chart-title">Energy Usage</h3>
      <div className="chart-wrapper">
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
              domain={[-'auto', 'auto']}
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
                        padding: '16px 18px',
                        border: 'none',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        fontSize: 14,
                      }}
                    >
                      <p style={{ color: isNegative ? APP_SOLAR_COLOR : APP_CONSUMPTION_COLOR, margin: 0 }}>
                        <strong>
                          {isNegative ? '↓' : '↑'} {abs} kWh
                        </strong>
                        <span style={{ marginLeft: '8px' }}>{isNegative ? 'Solar Generated' : 'Energy Used'}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="netConsumption" fill="#3b82f6" stroke="none" radius={[4, 4, 4, 4]} isAnimationActive={true} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
