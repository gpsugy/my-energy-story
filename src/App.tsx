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
export const APP_HEADER_BG = '#ecfdf5';
export const APP_HEADER_BORDER = '#d1fae5';

function App() {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [dailyConsumption, setdailyConsumption] = useState<Map<string, number>>(new Map());
  const [dailyGenerations, setDailyGenerations] = useState<Map<string, number>>(new Map());
  const [weeklyConsumption, setweeklyConsumption] = useState<Map<string, number>>(new Map());
  const [dailyKeys, setDailyKeys] = useState<string[]>([]);
  const [weeklyKeys, setWeeklyKeys] = useState<string[]>([]);
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
    setCurrentIndex(newIndex >= 0 ? newIndex : 0);
  }, [energyData, grouping]);

  const loadData = async (source: File | string): Promise<void> => {
    try {
      const data = await parseCSV(source);
      setEnergyData(data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

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

  useEffect(() => {
    loadDefaultData();
  }, []);

  const currentKeys = grouping === 'daily' ? dailyKeys : weeklyKeys;
  const currentKey = currentKeys[currentIndex] || '';
  const onPrev = () => (currentIndex > 0 ? setCurrentIndex(currentIndex - 1) : null);
  const onNext = () => (currentIndex < currentKeys.length - 1 ? setCurrentIndex(currentIndex + 1) : null);
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex >= currentKeys.length - 1;

  if (!currentKey) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="header-content">
          <div className="date-navigation">
            <button onClick={onPrev} disabled={isPrevDisabled} className="nav-button">
              {'‹'}
            </button>
            <h2 className="date-display">
              {grouping === 'daily'
                ? format(parseISO(currentKey), 'MMM d, yyyy')
                : (() => {
                    const start = parseISO(currentKey);
                    const end = new Date(start);
                    end.setDate(start.getDate() + 6);
                    return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
                  })()}
            </h2>
            <button onClick={onNext} disabled={isNextDisabled} className="nav-button">
              {'›'}
            </button>
          </div>

          <div className="grouping-toggle">
            <button
              onClick={() => {
                setGrouping('daily');
                setCurrentIndex(dailyKeys.length - 1);
              }}
              className={`toggle-button ${grouping === 'daily' ? 'active' : ''}`}
            >
              DAY
            </button>
            <button
              onClick={() => {
                setGrouping('weekly');
                setCurrentIndex(weeklyKeys.length - 1);
              }}
              className={`toggle-button ${grouping === 'weekly' ? 'active' : ''}`}
            >
              WEEK
            </button>
          </div>

          <div className="file-controls">
            <FileUploader onFileSelect={(file) => loadData(file)} buttonClass="upload-button" />
            <button onClick={loadDefaultData} className="upload-button load-default-data-button">
              Load Default Data
            </button>
          </div>
        </div>
      </header>

      <main className="container main-container">
        <div className="content-grid">
          <div>
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
          <div>
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
