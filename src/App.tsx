// App.tsx
import { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import EnergyChart from './components/EnergyChart';
import { parseCSV } from './utils/dataProcessing';
import { EnergyData } from './types/energy';
import { parseISO, isValid } from 'date-fns';
import './App.css';

const DEFAULT_CSV_DATA_PATH = '/high-winter-interval-data.csv';

function App() {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [targetDate, setTargetDate] = useState<Date | null>(null); // ← Add this

  useEffect(() => {
    if (energyData && energyData.length > 0) {
      const initDate = energyData[energyData.length - 1];

      // Parse datetime string
      const date = parseISO(initDate.datetime);

      console.log(energyData[energyData.length - 1]);
      if (isValid(date)) {
        setTargetDate(date);
      } else {
        console.warn('Invalid date in last row:', initDate.datetime);
      }
    }
  }, [energyData]);

  // Load data from file or URL
  const loadData = async (source: File | string): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await parseCSV(source);
      setEnergyData(data);
      setTargetDate(new Date()); // Reset to today when new data loads
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load default data on mount
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

  // Navigation handlers
  const onPrevDay = () => targetDate && setTargetDate(new Date(targetDate.setDate(targetDate.getDate() - 1)));
  const onNextDay = () => targetDate && setTargetDate(new Date(targetDate.setDate(targetDate.getDate() + 1)));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Energy Story</h1>

      {/* File Upload */}
      <div className="flex items-center space-x-4 mb-6">
        <FileUploader onFileSelect={(file) => loadData(file)} />
        <button
          onClick={() => loadData(DEFAULT_CSV_DATA_PATH)}
          className="text-sm underline text-gray-600 hover:text-gray-800"
        >
          Load Default Data
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-gray-600">Loading...</div>
      ) : energyData ? (
        <div className="space-y-6">
          {/* Hourly Chart */}
          <EnergyChart data={energyData} targetDate={targetDate} onPrevDay={onPrevDay} onNextDay={onNextDay} />

          {/* Debug: Raw Data */}
          <details className="text-xs">
            <summary>Raw Data Sample</summary>
            <pre className="mt-2 p-2 bg-gray-50 rounded">{JSON.stringify(energyData[0], null, 2)}</pre>
          </details>
        </div>
      ) : (
        <div className="text-red-600">No data loaded.</div>
      )}
    </div>
  );
}

export default App;
