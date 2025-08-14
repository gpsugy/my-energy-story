import Papa from 'papaparse';
import { EnergyData, EnergyInterval } from '../types/energy';

// Parses CSV data from a file or string input
export const parseCSV = (input: File | string): Promise<EnergyData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(input, {
      header: true,
      dynamicTyping: true,
      complete: (results) => resolve(results.data as EnergyInterval[]),
      error: (error) => reject(error),
    });
  });
};
