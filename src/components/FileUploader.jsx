import { useCallback } from 'react';
import { parseCSV } from '../utils/dataProcessing';

function FileUploader({ onDataLoaded }) {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
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
