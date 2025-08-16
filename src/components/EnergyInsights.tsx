import { format, parseISO } from 'date-fns';
import { APP_CONSUMPTION_COLOR, APP_SOLAR_COLOR } from '../App';

interface EnergyInsightsProps {
  grouping: 'daily' | 'weekly';
  currentKey: string;
  dailyConsumption: Map<string, number>;
  dailyGenerations: Map<string, number>;
}

export default function EnergyInsights({
  grouping,
  currentKey,
  dailyConsumption,
  dailyGenerations,
}: EnergyInsightsProps) {
  const formatKWh = (kwh: number) => `${kwh.toFixed(1)} kWh`;

  let totalConsumption = 0;
  let totalSolar = 0;

  if (grouping === 'daily') {
    totalConsumption = dailyConsumption.get(currentKey) || 0;
    totalSolar = dailyGenerations.get(currentKey) || 0;
  } else {
    const weekStart = parseISO(currentKey);
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateKey = format(date, 'yyyy-MM-dd');
      totalConsumption += dailyConsumption.get(dateKey) || 0;
      totalSolar += dailyGenerations.get(dateKey) || 0;
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Energy Insights</h3>
      <div className="flex space-x-4">
        {/* Total Consumption */}
        <div
          className="flex-1 flex flex-col items-center justify-center py-2 px-4 border border-gray-200 rounded-lg bg-gray-50 aspect-square max-h-32"
          style={{ color: APP_CONSUMPTION_COLOR }}
        >
          <span className="text-sm font-medium text-gray-700">Total Consumption</span>
          <span className="text-lg font-bold mt-1">{formatKWh(totalConsumption)}</span>
        </div>

        {/* Solar Generated */}
        <div
          className="flex-1 flex flex-col items-center justify-center py-2 px-4 border border-gray-200 rounded-lg bg-gray-50 aspect-square max-h-32"
          style={{ color: APP_SOLAR_COLOR }}
        >
          <span className="text-sm font-medium text-gray-700">Solar Generated</span>
          <span className="text-lg font-bold mt-1">{formatKWh(totalSolar)}</span>
        </div>
      </div>
    </div>
  );
}
