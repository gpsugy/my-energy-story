export interface EnergyInterval {
  datetime: Date;
  duration: number;
  unit: string;
  consumption: number;
  generation: number;
}

export type RawEnergyData = EnergyInterval[];

export type EnergyData = {
  daily: {
    keys: string[];
    consumption: Map<string, number>;
    generation: Map<string, number>;
  };
  weekly: {
    keys: string[];
    consumption: Map<string, number>;
    generation: Map<string, number>;
  };
};
