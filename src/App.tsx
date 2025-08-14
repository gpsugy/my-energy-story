import { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import EnergyChart from './components/EnergyChart';
import { parseCSV } from './utils/dataProcessing';
import { EnergyData } from './types/energy';
import './App.css';

const DEFAULT_CSV_DATA_PATH = '/high-winter-interval-data.csv';

function App() {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // TODO: Improve redundancy with loadData
  useEffect(() => {
    const loadDefaultData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(DEFAULT_CSV_DATA_PATH);
        const text = await res.text();
        const data = await parseCSV(text);
        setEnergyData(data);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDefaultData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Energy Usage</h1>
      <div className="flex items-center space-x-4 mb-6">
        <FileUploader onFileSelect={(file) => loadData(file)} />
      </div>

      {isLoading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        energyData && (
          <div className="space-y-6">
            <EnergyChart data={energyData} mode={'daily'} />
            <details className="text-xs">
              <summary>Raw Data Sample</summary>
              <pre className="mt-2 p-2 bg-gray-50 rounded">{JSON.stringify(energyData[0], null, 2)}</pre>
            </details>
          </div>
        )
      )}
    </div>
  );
}

export default App;
