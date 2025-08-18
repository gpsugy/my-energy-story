import { format, parseISO, startOfWeek } from 'date-fns';
import { APP_CONSUMPTION_COLOR, APP_SOLAR_COLOR } from '../App';

export default function EnergyInsights({
  grouping,
  currentKey,
  dailyConsumption,
  dailyGenerations,
  weeklyConsumption,
}: {
  grouping: 'daily' | 'weekly';
  currentKey: string;
  dailyConsumption: Map<string, number>;
  dailyGenerations: Map<string, number>;
  weeklyConsumption: Map<string, number>;
}) {
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

  if (grouping === 'daily') {
    totalConsumption = dailyConsumption.get(currentKey) || 0;
    totalSolar = dailyGenerations.get(currentKey) || 0;

    const dailyKeys = Array.from(dailyConsumption.keys()).sort();
    const currentIndex = dailyKeys.indexOf(currentKey);
    const prevKey = dailyKeys[currentIndex - 1];
    const yesterdayConsumption = prevKey ? dailyConsumption.get(prevKey) || 0 : 0;

    if (prevKey) {
      diff = totalConsumption - yesterdayConsumption;
      comparisonLabel = 'than yesterday';
    }

    const weekStart = startOfWeek(parseISO(currentKey), { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    const weeklyTotal = weeklyConsumption.get(weekKey) || 0;
    const weeklyAvg = weeklyTotal / 7;

    avgDiff = totalConsumption - weeklyAvg;
    avgLabel = 'than average this week';
  } else {
    const weekStart = parseISO(currentKey);
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateKey = format(date, 'yyyy-MM-dd');
      totalConsumption += dailyConsumption.get(dateKey) || 0;
      totalSolar += dailyGenerations.get(dateKey) || 0;
    }

    const weeklyKeys = Array.from(weeklyConsumption.keys()).sort();
    const currentIndex = weeklyKeys.indexOf(currentKey);
    const lastWeekKey = weeklyKeys[currentIndex - 1];
    const lastWeekConsumption = lastWeekKey ? weeklyConsumption.get(lastWeekKey) || 0 : 0;
    const thisWeekConsumption = weeklyConsumption.get(currentKey) || 0;

    if (lastWeekKey) {
      diff = thisWeekConsumption - lastWeekConsumption;
      comparisonLabel = 'than last week';
    }

    const weeklyValues = Array.from(weeklyConsumption.values());
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
