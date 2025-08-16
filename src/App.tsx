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
    try {
      const data = await parseCSV(source);
      setEnergyData(data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        const res = await fetch(DEFAULT_CSV_DATA_PATH);
        const text = await res.text();
        const data = await parseCSV(text);
        setEnergyData(data);
      } catch (err) {
        console.error('Error loading default data:', err);
      }
    };
    loadDefaultData();
  }, []);

  // Navigation
  const currentKeys = grouping === 'daily' ? dailyKeys : weeklyKeys;
  const onPrev = () => (currentIndex > 0 ? setCurrentIndex(currentIndex - 1) : null);
  const onNext = () => (currentIndex < currentKeys.length - 1 ? setCurrentIndex(currentIndex + 1) : null);
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex >= currentKeys.length - 1;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Energy Story</h1>

      <div className="flex items-center space-x-4 mb-6">
        <FileUploader onFileSelect={(file) => loadData(file)} />
        <button
          onClick={() => loadData(DEFAULT_CSV_DATA_PATH)}
          className="text-sm underline text-gray-600 hover:text-gray-800"
        >
          Load Default Data
        </button>
      </div>
      <div className="flex items-center space-x-1 mb-6">
        <button
          onClick={() => {
            setGrouping('daily');
            setCurrentIndex(dailyKeys.length - 1);
          }}
          className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
            grouping === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          DAY
        </button>
        <button
          onClick={() => {
            setGrouping('weekly');
            setCurrentIndex(weeklyKeys.length - 1);
          }}
          className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
            grouping === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          WEEK
        </button>
      </div>

      {energyData &&
      ((grouping === 'daily' && dailyKeys.length > 0) || (grouping === 'weekly' && weeklyKeys.length > 0)) ? (
        <EnergyChart
          data={energyData}
          keys={grouping === 'daily' ? dailyKeys : weeklyKeys}
          dailyTotals={dailyTotals}
          weeklyTotals={weeklyTotals}
          grouping={grouping}
          currentIndex={currentIndex}
          onPrev={onPrev}
          onNext={onNext}
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
