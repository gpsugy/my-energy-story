import Papa from 'papaparse';
import { parseISO, isSameDay, isValid } from 'date-fns';
import { EnergyData, EnergyInterval } from '../types/energy';

import { format, startOfWeek } from 'date-fns';

interface RawEnergyRow {
  datetime: string;
  duration: string;
  unit?: string;
  consumption: string;
  generation: string;
}

export interface buildAggregateDataReturn {
  dailyTotals: Map<string, number>;
  weeklyTotals: Map<string, number>;
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

        if (results.data.length > 0) {
          console.log('CSV parsed. First row:', results.data[0]);
        }

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
  const dailyTotals = new Map<string, number>();
  const weeklyTotals = new Map<string, number>();

  for (const interval of data) {
    // Daily key: '2023-09-08'
    const dateKey = format(interval.datetime, 'yyyy-MM-dd');
    dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + interval.consumption);

    // Weekly key: Monday of the week
    const weekKey = format(startOfWeek(interval.datetime, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    weeklyTotals.set(weekKey, (weeklyTotals.get(weekKey) || 0) + interval.consumption);
  }

  // Build sorted keys to access data
  const dailyKeys = Array.from(dailyTotals.keys()).sort();
  const weeklyKeys = Array.from(weeklyTotals.keys()).sort();

  return {
    dailyTotals,
    weeklyTotals,
    dailyKeys,
    weeklyKeys,
  };
};

// Aggregates 15-min data into hourly consumption for a single day
export const getHourlyForDay = (data: EnergyData, targetDate: Date): Array<{ hour: number; consumption: number }> => {
  const dayData = data.filter((interval) => isSameDay(interval.datetime, targetDate));

  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    consumption: 0,
  }));

  for (const interval of dayData) {
    const hour = interval.datetime.getHours();
    hourly[hour].consumption += interval.consumption;
  }

  return hourly;
};
