interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  buttonClass?: string;
}

export default function FileUploader({
  onFileSelect,
  buttonClass = 'bg-blue-600 text-white hover:bg-blue-700',
}: FileUploaderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div>
      <label className={`cursor-pointer px-4 py-2 rounded text-sm font-medium ${buttonClass}`}>
        Upload CSV
        <input type="file" accept=".csv" onChange={handleChange} className="sr-only" />
      </label>
    </div>
  );
}
