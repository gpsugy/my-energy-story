import { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import EnergyChart from './components/EnergyChart';
import { buildAggregateData, parseCSV } from './utils/dataProcessing';
import { EnergyData } from './types/energy';

import './App.css';
import EnergyInsights from './components/EnergyInsights';
import { format, parseISO } from 'date-fns';

const DEFAULT_CSV_DATA_PATH = '/solar-interval-data.csv';
export const APP_TEXT_COLOR = '#434343ff';
export const APP_CONSUMPTION_COLOR = '#3b82f6ff';
export const APP_SOLAR_COLOR = '#fba824ff';
export const APP_HEADER_BG = '#ecfdf5'; // Eco-green (Tailwind's emerald-50)
export const APP_HEADER_BORDER = '#d1fae5'; // emerald-200

function App() {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [dailyConsumption, setdailyConsumption] = useState<Map<string, number>>(new Map()); // { '2023-09-08': 30, ... }
  const [dailyGenerations, setDailyGenerations] = useState<Map<string, number>>(new Map()); // { '2023-09-08': 20, ... }
  const [weeklyConsumption, setweeklyConsumption] = useState<Map<string, number>>(new Map()); // { '2023-09-04': 150, ... }
  const [dailyKeys, setDailyKeys] = useState<string[]>([]); // [ '2023-09-08', '2023-09-09', ... ]
  const [weeklyKeys, setWeeklyKeys] = useState<string[]>([]); // [ '2023-09-04', '2023-09-11', ... ]
  const [currentIndex, setCurrentIndex] = useState(0);
  const [grouping, setGrouping] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    if (!energyData || energyData.length === 0) return;

    const { dailyConsumption, dailyGenerations, weeklyConsumption, dailyKeys, weeklyKeys } =
      buildAggregateData(energyData);

    setdailyConsumption(dailyConsumption);
    setDailyGenerations(dailyGenerations);
    setweeklyConsumption(weeklyConsumption);
    setDailyKeys(dailyKeys);
    setWeeklyKeys(weeklyKeys);

    const keys = grouping === 'daily' ? dailyKeys : weeklyKeys;
    const newIndex = keys.length - 1;
    // Start with most recent
    setCurrentIndex(newIndex >= 0 ? newIndex : 0);
  }, [energyData, grouping]);

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

  // Derived state - leave in the render
  const currentKeys = grouping === 'daily' ? dailyKeys : weeklyKeys;
  const currentKey = currentKeys[currentIndex] || '';
  const onPrev = () => (currentIndex > 0 ? setCurrentIndex(currentIndex - 1) : null);
  const onNext = () => (currentIndex < currentKeys.length - 1 ? setCurrentIndex(currentIndex + 1) : null);
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex >= currentKeys.length - 1;

  if (!currentKey) {
    return <div className="text-gray-600">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-emerald-600 px-6 py-4 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Date + Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onPrev}
              disabled={isPrevDisabled}
              className={`text-5xl font-bold text-white leading-none ${
                isPrevDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
              }`}
            >
              {'‹'}
            </button>
            <h2 className="text-lg font-semibold text-white">
              {grouping === 'daily'
                ? format(parseISO(currentKey), 'MMM d, yyyy')
                : (() => {
                    const start = parseISO(currentKey);
                    const end = new Date(start);
                    end.setDate(start.getDate() + 6);
                    return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
                  })()}
            </h2>
            <button
              onClick={onNext}
              disabled={isNextDisabled}
              className={`text-5xl font-bold text-white leading-none ${
                isNextDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
              }`}
            >
              {'›'} {/* Single right-pointing angle */}
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-transparent">
            <button
              onClick={() => {
                setGrouping('daily');
                setCurrentIndex(dailyKeys.length - 1);
              }}
              className={`px-4 py-2 text-sm font-medium text-white border-b-2 bg-transparent transition-colors ${
                grouping === 'daily' ? 'border-white' : 'border-transparent hover:border-white'
              }`}
            >
              DAY
            </button>
            <button
              onClick={() => {
                setGrouping('weekly');
                setCurrentIndex(weeklyKeys.length - 1);
              }}
              className={`px-4 py-2 text-sm font-medium text-white border-b-2 bg-transparent transition-colors ${
                grouping === 'weekly' ? 'border-white' : 'border-transparent hover:border-white'
              }`}
            >
              WEEK
            </button>
          </div>

          {/* File Upload */}
          <div className="flex items-center space-x-6">
            <FileUploader
              onFileSelect={(file) => loadData(file)}
              buttonClass="bg-transparent text-white border border-white hover:bg-white hover:text-emerald-600 text-sm px-4 py-2"
            />
            <button
              onClick={() => loadData(DEFAULT_CSV_DATA_PATH)}
              className="text-sm text-white hover:underline bg-transparent"
            >
              Load Default Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <EnergyChart
              data={energyData!}
              keys={currentKeys}
              dailyConsumption={dailyConsumption}
              dailyGenerations={dailyGenerations}
              weeklyConsumption={weeklyConsumption}
              grouping={grouping}
              currentIndex={currentIndex}
              onPrev={onPrev}
              onNext={onNext}
              isPrevDisabled={isPrevDisabled}
              isNextDisabled={isNextDisabled}
            />
          </div>
          <div className="lg:col-span-2">
            <EnergyInsights
              grouping={grouping}
              currentKey={currentKey}
              dailyConsumption={dailyConsumption}
              dailyGenerations={dailyGenerations}
              weeklyConsumption={weeklyConsumption}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
