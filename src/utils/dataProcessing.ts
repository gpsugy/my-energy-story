import Papa from 'papaparse';
import { parseISO, isValid } from 'date-fns';
import { EnergyData, EnergyInterval } from '../types/energy';

interface RawEnergyRow {
  datetime: string;
  duration: string;
  unit?: string;
  consumption: string;
  generation: string;
}

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
