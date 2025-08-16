import { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import EnergyChart from './components/EnergyChart';
import { buildAggregateData, parseCSV } from './utils/dataProcessing';
import { EnergyData } from './types/energy';

import './App.css';

const DEFAULT_CSV_DATA_PATH = '/high-winter-interval-data.csv';

function App() {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [dailyTotals, setDailyTotals] = useState<Map<string, number>>(new Map());
  const [weeklyTotals, setWeeklyTotals] = useState<Map<string, number>>(new Map());
  const [dailyKeys, setDailyKeys] = useState<string[]>([]);
  const [weeklyKeys, setWeeklyKeys] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [grouping, setGrouping] = useState<'daily' | 'weekly'>('daily');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!energyData || energyData.length === 0) return;

    const { dailyTotals, weeklyTotals, dailyKeys, weeklyKeys } = buildAggregateData(energyData);

    setDailyTotals(dailyTotals);
    setWeeklyTotals(weeklyTotals);
    setDailyKeys(dailyKeys);
    setWeeklyKeys(weeklyKeys);
    // Start with most recent
    setCurrentIndex(dailyKeys.length - 1);
  }, [energyData]);

  // Load specific CSV file
  const loadData = async (source: File | string): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await parseCSV(source);
      setEnergyData(data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadDefaultData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(DEFAULT_CSV_DATA_PATH);
        const text = await res.text();
        const data = await parseCSV(text);
        setEnergyData(data);
      } catch (err) {
        console.error('Error loading default data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDefaultData();
  }, []);

  // Navigation
  const onPrevDay = () => (currentIndex > 0 ? setCurrentIndex(currentIndex - 1) : null);
  const onNextDay = () => (currentIndex < dailyKeys.length - 1 ? setCurrentIndex(currentIndex + 1) : null);

  // Get current date string and Date object
  const currentKey = dailyKeys[currentIndex] || null;
  // const targetDate = currentKey ? new Date(currentKey) : null;

  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = !dailyKeys.length || currentIndex >= dailyKeys.length - 1;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Energy Dashboard</h1>
      <div className="flex items-center space-x-4 mb-6">
        <FileUploader onFileSelect={(file) => loadData(file)} />
        <button
          onClick={() => loadData(DEFAULT_CSV_DATA_PATH)}
          className="text-sm underline text-gray-600 hover:text-gray-800"
        >
          Load Default Data
        </button>
      </div>
      {isLoading ? (
        <div className="text-gray-600">Loading...</div>
      ) : energyData && dailyKeys.length > 0 && currentIndex >= 0 ? (
        <EnergyChart
          data={energyData}
          dailyKeys={dailyKeys}
          currentIndex={currentIndex}
          onPrevDay={onPrevDay}
          onNextDay={onNextDay}
          isPrevDisabled={isPrevDisabled}
          isNextDisabled={isNextDisabled}
        />
      ) : (
        <div className="text-gray-600">Loading...</div>
      )}
    </div>
  );
}

export default App;
