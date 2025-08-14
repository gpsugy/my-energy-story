import { ChangeEvent } from 'react';
import { parseCSV } from '../utils/dataProcessing';
import { EnergyData } from '../types/energy';

interface FileUploaderProps {
  onDataLoaded: (data: EnergyData) => void;
}

function FileUploader({ onDataLoaded }: FileUploaderProps): React.ReactElement {
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseCSV(file);
      onDataLoaded(data);
    } catch (error) {
      console.error('Error parsing CSV:', error);
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  );
}

export default FileUploader;
