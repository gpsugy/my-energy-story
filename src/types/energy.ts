export interface EnergyInterval {
  datetime: string;
  duration: number;
  unit: string;
  consumption: number;
  generation: number;
}

export type EnergyData = EnergyInterval[];
