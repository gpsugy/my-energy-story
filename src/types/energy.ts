export interface EnergyInterval {
  datetime: Date;
  duration: number;
  unit: string;
  consumption: number;
  generation: number;
}

export type EnergyData = EnergyInterval[];

export interface ChartDataPointReturn {
  hour?: number;
  day?: string;
  consumption: number;
}
export interface EnergyChartProps {
  data: EnergyData;
  keys: string[];
  dailyTotals: Map<string, number>;
  weeklyTotals: Map<string, number>;
  grouping: 'daily' | 'weekly';
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
}
