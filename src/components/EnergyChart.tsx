import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { EnergyData } from '../types/energy';
import { getHourlyChartDataForDay, getDailyChartDataForWeek } from '../utils/dataProcessing';
import { useMemo } from 'react';
import { APP_CONSUMPTION_COLOR, APP_SOLAR_COLOR, APP_TEXT_COLOR } from '../App';

export interface EnergyChartProps {
  data: EnergyData;
  keys: string[];
  dailyConsumption: Map<string, number>;
  dailyGenerations: Map<string, number>;
  weeklyConsumption: Map<string, number>;
  weeklyGenerations: Map<string, number>;
  grouping: 'daily' | 'weekly';
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
}

export default function EnergyChart(props: EnergyChartProps) {
  const {
    data,
    keys,
    dailyConsumption,
    dailyGenerations,
    weeklyConsumption,
    weeklyGenerations,
    grouping,
    currentIndex,
  } = props;
  const currentKey = keys[currentIndex];
  if (!currentKey) return null;

  const chartData = useMemo(() => {
    if (grouping === 'daily') {
      return getHourlyChartDataForDay(data, parseISO(currentKey));
    }
    return getDailyChartDataForWeek(parseISO(currentKey), dailyConsumption, dailyGenerations);
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
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  // The first payload element contains all the data
                  const data = payload[0].payload;
                  const consumption = data.consumption.toFixed(1) || 0;
                  const generation = data.generation.toFixed(1) || 0;
                  const netEnergy = data.consumption - data.generation || 0;

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
                      {/* Energy Used */}
                      {consumption > 0 && (
                        <p style={{ color: APP_CONSUMPTION_COLOR, margin: 0 }}>
                          <strong>↑ {consumption} kWh</strong>
                          <span style={{ marginLeft: '8px' }}>Energy Used</span>
                        </p>
                      )}

                      {/* Solar Generated */}
                      {generation > 0 && (
                        <p
                          style={{
                            color: APP_SOLAR_COLOR,
                            margin: consumption > 0 ? '8px 0 0 0' : 0,
                          }}
                        >
                          <strong>↓ {generation} kWh</strong>
                          <span style={{ marginLeft: '8px' }}>Solar Generated</span>
                        </p>
                      )}

                      {/* Net Energy — only when both consumption/generation exist */}
                      {consumption > 0 && generation > 0 && (
                        <p
                          style={{
                            margin: '8px 0 0 0',
                            color: netEnergy > 0 ? APP_CONSUMPTION_COLOR : APP_SOLAR_COLOR,
                            borderTop: '1px solid #eee',
                            paddingTop: '8px',
                          }}
                        >
                          <strong>
                            {netEnergy > 0 ? '↑' : '↓'} {Math.abs(netEnergy).toFixed(1)} kWh
                          </strong>
                          <span style={{ marginLeft: '8px' }}>Net Energy</span>
                        </p>
                      )}
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
