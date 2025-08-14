import Papa from 'papaparse';
import { EnergyData } from '../types/energy';

// Parses CSV data from a file or string input
export const parseCSV = (input: File | string): Promise<EnergyData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(input, {
      header: true,
      dynamicTyping: (field) => field !== 'datetime',
      complete: (results) => {
        const data = results.data.map((row: any) => {
          // Ensure we are dealing with kWh
          const divideBy = (row.unit || '').toLowerCase() === 'wh' ? 1000 : 1;
          return {
            datetime: row.datetime,
            duration: row.duration,
            consumption: (row.consumption || 0) / divideBy,
            generation: (row.generation || 0) / divideBy,
          };
        });
        resolve(data as EnergyData);
      },
      error: reject,
    });
  });
};
