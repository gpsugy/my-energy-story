import { format, parseISO, startOfWeek } from 'date-fns';
import { APP_CONSUMPTION_COLOR, APP_SOLAR_COLOR } from '../App';
import { EnergyData } from '../types/energy';

export interface EnergyInsightProps {
  grouping: 'daily' | 'weekly';
  currentIndex: number;
  data: EnergyData | null;
}

export default function EnergyInsights({ grouping, currentIndex, data }: EnergyInsightProps) {
  if (!data || currentIndex < 0) return null;

  const formatKWh = (kwh: number) => `~${kwh.toFixed(1)} kWh`;
  const formatDiff = (kwh: number) => {
    const abs = Math.abs(kwh).toFixed(1);
    return kwh >= 0 ? `+${abs}` : `-${abs}`;
  };

  let totalConsumption = 0,
    totalSolar = 0,
    comparisonLabel = '',
    diff = 0,
    diffColor = '',
    avgLabel = '',
    avgDiff = 0,
    avgDiffColor = '';

  const currentKey = grouping === 'daily' ? data.daily.keys[currentIndex] : data.weekly.keys[currentIndex];
  if (!currentKey) return null;

  if (grouping === 'daily') {
    totalConsumption = data.daily.consumption.get(currentKey) || 0;
    totalSolar = data.daily.generation.get(currentKey) || 0;

    const prevKey = data.daily.keys[currentIndex - 1];
    const yesterdayConsumption = prevKey ? data.daily.consumption.get(prevKey) || 0 : 0;

    if (prevKey) {
      diff = totalConsumption - yesterdayConsumption;
      comparisonLabel = 'than yesterday';
    }

    const weeklyTotal = data.weekly.consumption.get(currentKey) || 0;
    const weeklyAvg = weeklyTotal / 7;

    avgDiff = totalConsumption - weeklyAvg;
    avgLabel = 'than average this week';
  } else {
    totalConsumption = data.weekly.consumption.get(currentKey) || 0;
    totalSolar = data.weekly.generation.get(currentKey) || 0;

    const lastWeekKey = data.weekly.keys[currentIndex - 1];
    const lastWeekConsumption = lastWeekKey ? data.weekly.consumption.get(lastWeekKey) || 0 : 0;
    const thisWeekConsumption = totalConsumption;

    if (lastWeekKey) {
      diff = thisWeekConsumption - lastWeekConsumption;
      comparisonLabel = 'than last week';
    }

    const weeklyValues = Array.from(data.weekly.consumption.values());
    const monthlyAvg = weeklyValues.reduce((a, b) => a + b, 0) / weeklyValues.length;

    avgDiff = thisWeekConsumption - monthlyAvg;
    avgLabel = 'than average this month';
  }

  diffColor = diff > 0 ? 'text-red' : 'text-green';
  avgDiffColor = avgDiff > 0 ? 'text-red' : 'text-green';

  return (
    <div className="energy-insights-container">
      <h3 className="insights-title">Energy Insights</h3>
      <div className="insight-cards">
        <div className="insight-card" style={{ color: APP_CONSUMPTION_COLOR }}>
          <span className="insight-label">Energy Used</span>
          <span className="insight-value">{formatKWh(totalConsumption)}</span>
        </div>
        <div className="insight-card" style={{ color: APP_SOLAR_COLOR }}>
          <span className="insight-label">Solar Generated</span>
          <span className="insight-value">{formatKWh(totalSolar)}</span>
        </div>
      </div>
      {(comparisonLabel || avgLabel) && (
        <div className="insight-cards">
          {comparisonLabel && (
            <div className="insight-card">
              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <span className={`comparison-value ${diffColor}`}>{formatDiff(diff)} kWh</span>
                <span className="comparison-label">{comparisonLabel}</span>
              </div>
            </div>
          )}
          {avgLabel && (
            <div className="insight-card">
              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <span className={`comparison-value ${avgDiffColor}`}>{formatDiff(avgDiff)} kWh</span>
                <span className="comparison-label">{avgLabel}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
