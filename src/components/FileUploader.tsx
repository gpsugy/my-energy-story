/* FileUploader.tsx */
interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  buttonClass?: string;
}

export default function FileUploader({ onFileSelect, buttonClass = 'upload-button' }: FileUploaderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div>
      <label className={buttonClass}>
        Upload CSV
        <input type="file" accept=".csv" onChange={handleChange} className="visually-hidden" />
      </label>
    </div>
  );
}
