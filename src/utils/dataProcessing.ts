import Papa from 'papaparse';
import { parseISO, isSameDay, isValid, format, startOfWeek } from 'date-fns';
import { EnergyData, EnergyInterval } from '../types/energy';
import { APP_CONSUMPTION_COLOR, APP_SOLAR_COLOR } from '../App';

interface RawEnergyRow {
  datetime: string;
  duration: string;
  unit?: string;
  consumption: string;
  generation: string;
}

export interface buildAggregateDataReturn {
  dailyConsumption: Map<string, number>;
  dailyGenerations: Map<string, number>;
  weeklyConsumption: Map<string, number>;
  dailyKeys: string[];
  weeklyKeys: string[];
}

// Parse a CSV file into typed EnergyData
export const parseCSV = (input: File | string): Promise<EnergyData> => {
  return new Promise((resolve, reject) => {
    Papa.parse<RawEnergyRow>(input, {
      header: true,
      dynamicTyping: false,
      complete: (results) => {
        const data: EnergyInterval[] = [];

        for (const row of results.data) {
          // Skip empty or invalid rows
          if (!row.datetime || row.datetime.trim() === '') {
            continue;
          }

          // Parse and validate date
          const date = parseISO(row.datetime.trim());
          if (!isValid(date)) {
            console.warn('Invalid date skipped:', row.datetime);
            continue;
          }

          // Normalize Wh → kWh and set unit
          const unit = (row.unit || '').toLowerCase();
          const divideBy = unit === 'wh' ? 1000 : 1;
          const finalUnit = unit === 'wh' ? 'kWh' : unit || 'kWh';

          const consumption = parseInt(row.consumption) || 0;
          const generation = parseInt(row.generation) || 0;

          data.push({
            datetime: date,
            duration: parseInt(row.duration, 10) || 900,
            unit: finalUnit,
            consumption: consumption / divideBy,
            generation: generation / divideBy,
          });
        }

        resolve(data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

// Build and load various data structures related to aggregating data from raw (15-min interval) energy data
export const buildAggregateData = (data: EnergyData): buildAggregateDataReturn => {
  const dailyConsumption = new Map<string, number>();
  const dailyGenerations = new Map<string, number>();
  const weeklyConsumption = new Map<string, number>();

  for (const interval of data) {
    // Add to the totals for the day
    const dateKey = format(interval.datetime, 'yyyy-MM-dd');
    dailyConsumption.set(dateKey, (dailyConsumption.get(dateKey) || 0) + interval.consumption);
    dailyGenerations.set(dateKey, (dailyGenerations.get(dateKey) || 0) + interval.generation);

    // Add to the total for the week
    const weekKey = format(startOfWeek(interval.datetime, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    weeklyConsumption.set(weekKey, (weeklyConsumption.get(weekKey) || 0) + interval.consumption);
  }

  const dailyKeys = Array.from(dailyConsumption.keys()).sort();
  const weeklyKeys = Array.from(weeklyConsumption.keys()).sort();

  return {
    dailyConsumption,
    dailyGenerations,
    weeklyConsumption,
    dailyKeys,
    weeklyKeys,
  };
};

export const getDisplayDate = (currentKey: string, grouping: 'daily' | 'weekly'): string => {
  if (grouping === 'daily') return format(parseISO(currentKey), 'MMM d, yyyy');

  const start = parseISO(currentKey);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
};

// Aggregates 15-min data into hourly consumption for a given date
// Returns: { hour: 0, consumption: 0.42 }, ... (24 items)
export const getHourlyForDay = (
  data: EnergyData,
  targetDate: Date
): Array<{ hour: number; consumption: number; generation: number; netConsumption: number; fill: string }> => {
  // Get all 15-min interval data for a specific targetDate
  const dayData = data.filter((interval) => isSameDay(interval.datetime, targetDate));
  // Pre-initialize the return output with 0 consumption (data for an hour might not exist)
  const hourly = Array(24)
    .fill(0)
    .map((_, i) => ({ hour: i, consumption: 0, generation: 0, netConsumption: 0 }));

  for (const interval of dayData) {
    // Get the hour of the day for this 15-min interval
    const hour = interval.datetime.getHours();
    hourly[hour].consumption += interval.consumption;
    hourly[hour].generation += interval.generation;
    hourly[hour].netConsumption += interval.consumption - interval.generation;
  }

  // Set color after net consumption is final (Recharts expects a string when using fill)
  return hourly.map((h) => ({
    ...h,
    fill: h.netConsumption >= 0 ? APP_CONSUMPTION_COLOR : APP_SOLAR_COLOR,
  }));
};

// Aggregates daily consumption totals for a given week
// Returns: { day: 'Mon', consumption: 12.34 }, ... (7 items)
export const getWeeklyChartData = (
  weekStart: Date,
  dailyConsumption: Map<string, number>,
  dailyGenerations: Map<string, number>
): {
  hour?: number;
  day?: string;
  consumption: number;
  generation: number;
  netConsumption: number;
  fill: string;
}[] => {
  // Loop over 7 days
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);

    const dateKey = format(date, 'yyyy-MM-dd');

    const consumption = dailyConsumption.get(dateKey) || 0;
    const generation = dailyGenerations.get(dateKey) || 0;
    const netConsumption = consumption - generation;

    return {
      day: format(date, 'EEE'),
      consumption,
      generation,
      netConsumption,
      fill: netConsumption >= 0 ? APP_CONSUMPTION_COLOR : APP_SOLAR_COLOR,
    };
  });
};
