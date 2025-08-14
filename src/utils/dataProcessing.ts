import Papa from 'papaparse';
import { EnergyData, EnergyInterval } from '../types/energy';

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

export const loadDefaultData = async (): Promise<EnergyData> => {
  const res = await fetch('/low-winter-interval-data.csv');
  const text = await res.text();
  return parseCSV(text);
};
