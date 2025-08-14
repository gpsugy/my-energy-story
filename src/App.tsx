import { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import { loadDefaultData } from './utils/dataProcessing';
import { EnergyData } from './types/energy';
import './App.css';

function App() {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const data = await loadDefaultData();
        setEnergyData(data);
        console.log(data[0]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Energy Usage</h1>
      <div className="flex items-center space-x-4 mb-6">
        <FileUploader onDataLoaded={setEnergyData} />
      </div>

      {energyData && <pre className="text-xs rounded">{JSON.stringify(energyData[0])}</pre>}
    </div>
  );
}

export default App;
