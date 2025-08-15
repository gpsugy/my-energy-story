export interface EnergyInterval {
  datetime: Date;
  duration: number;
  unit: string;
  consumption: number;
  generation: number;
}

export type EnergyData = EnergyInterval[];
