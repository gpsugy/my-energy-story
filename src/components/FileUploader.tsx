import { ChangeEvent } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => Promise<void>;
}

function FileUploader({ onFileSelect }: FileUploaderProps): React.ReactElement {
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    onFileSelect(file);
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  );
}

export default FileUploader;
