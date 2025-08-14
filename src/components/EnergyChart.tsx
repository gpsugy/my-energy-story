import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfWeek, format } from 'date-fns';
import { EnergyData } from '../types/energy';

type ChartMode = 'daily' | 'weekly';

interface EnergyChartProps {
  data: EnergyData;
  mode: ChartMode;
}

export default function EnergyChart({ data, mode }: EnergyChartProps) {
  // Log the first few items to debug
  console.log('First few data points:', data.slice(0, 3));

  // 🧹 Clear, readable aggregation
  const aggregated: Record<string, { label: string; consumption: number; generation: number }> = {};

  for (const interval of data) {
    const date = new Date(interval.datetime);

    // Validate
    if (!date || isNaN(date.getTime())) {
      console.warn('Invalid date:', interval.datetime);
      continue;
    }

    // TODO: Dynamically change to weekly here
    const key = format(date, 'yyyy-MM-dd');
    if (!aggregated[key]) {
      aggregated[key] = { label: key, consumption: 0, generation: 0 };
    }

    aggregated[key].consumption += interval.consumption || 0;
    aggregated[key].generation += interval.generation || 0;
  }

  // 📊 Convert to sorted array
  const chartData = Object.values(aggregated).sort((a, b) => a.label.localeCompare(b.label));

  const maxY = Math.max(...chartData.map((d) => Math.max(d.consumption, d.generation)));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis domain={[0, Math.ceil(maxY * 1.1)]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="consumption" stroke="#8884d8" name="Consumption (kWh)" />
          <Line type="monotone" dataKey="generation" stroke="#82ca9d" name="Generation (kWh)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
