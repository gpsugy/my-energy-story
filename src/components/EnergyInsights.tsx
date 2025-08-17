// components/EnergyInsights.tsx
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

    // --- Vs Yesterday ---
    const dailyKeys = Array.from(dailyConsumption.keys()).sort();
    const currentIndex = dailyKeys.indexOf(currentKey);
    const prevKey = dailyKeys[currentIndex - 1];
    const yesterdayConsumption = prevKey ? dailyConsumption.get(prevKey) || 0 : 0;

    if (prevKey) {
      diff = totalConsumption - yesterdayConsumption;
      comparisonLabel = 'than yesterday';
    }

    // --- Vs Average This Week ---
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

    // --- Vs Last Week ---
    const weeklyKeys = Array.from(weeklyConsumption.keys()).sort();
    const currentIndex = weeklyKeys.indexOf(currentKey);
    const lastWeekKey = weeklyKeys[currentIndex - 1];
    const lastWeekConsumption = lastWeekKey ? weeklyConsumption.get(lastWeekKey) || 0 : 0;
    const thisWeekConsumption = weeklyConsumption.get(currentKey) || 0;

    if (lastWeekKey) {
      diff = thisWeekConsumption - lastWeekConsumption;
      comparisonLabel = 'than last week';
    }

    // --- Vs Average This Month ---
    const weeklyValues = Array.from(weeklyConsumption.values());
    // Calculate the average weekly consumption for the month
    const monthlyAvg = weeklyValues.reduce((a, b) => a + b, 0) / weeklyValues.length;

    avgDiff = thisWeekConsumption - monthlyAvg;
    avgLabel = 'than average this month';
  }

  // Set colors: red if worse (used more), green if better
  diffColor = diff > 0 ? 'text-red-600' : 'text-green-600';
  avgDiffColor = avgDiff > 0 ? 'text-red-600' : 'text-green-600';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Energy Insights</h3>
      <div className="flex space-x-4 mb-4">
        <div
          className="flex-1 flex flex-col items-center justify-center py-2 px-4 border border-gray-200 rounded-lg bg-gray-50 aspect-square max-h-32"
          style={{ color: APP_CONSUMPTION_COLOR }}
        >
          <span className="text-sm font-medium text-gray-700">Energy Used</span>
          <span className="text-lg font-bold mt-1">{formatKWh(totalConsumption)}</span>
        </div>
        <div
          className="flex-1 flex flex-col items-center justify-center py-2 px-4 border border-gray-200 rounded-lg bg-gray-50 aspect-square max-h-32"
          style={{ color: APP_SOLAR_COLOR }}
        >
          <span className="text-sm font-medium text-gray-700">Solar Generated</span>
          <span className="text-lg font-bold mt-1">{formatKWh(totalSolar)}</span>
        </div>
      </div>
      {(comparisonLabel || avgLabel) && (
        <div className="flex space-x-4">
          {comparisonLabel && (
            <div className="flex-1 flex flex-col items-center justify-center py-2 px-4 border border-gray-200 rounded-lg bg-gray-50 aspect-square max-h-32">
              <div className="text-center mt-1">
                <span className={`font-bold ${diffColor}`}>{formatDiff(diff)} kWh</span>
                <span className="text-sm font-medium text-gray-700 block mt-0.5">{comparisonLabel}</span>
              </div>
            </div>
          )}
          {avgLabel && (
            <div className="flex-1 flex flex-col items-center justify-center py-2 px-4 border border-gray-200 rounded-lg bg-gray-50 aspect-square max-h-32">
              <div className="text-center mt-1">
                <span className={`font-bold ${avgDiffColor}`}>{formatDiff(avgDiff)} kWh</span>
                <span className="text-sm font-medium text-gray-700 block mt-0.5">{avgLabel}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
