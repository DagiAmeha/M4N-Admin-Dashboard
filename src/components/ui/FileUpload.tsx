import { type ChangeEvent, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
  current?: string;
  multiple?: boolean;
  onMultipleChange?: (files: File[]) => void;
}

export default function FileUpload({
  label, accept, onChange, current, multiple, onMultipleChange,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    if (multiple && onMultipleChange) {
      onMultipleChange(Array.from(files));
    } else {
      onChange(files[0] ?? null);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-indigo-400 transition-colors"
      >
        <div className="flex flex-col items-center gap-2">
          <Upload size={20} className="text-gray-400" />
          <span className="text-sm text-gray-500">Click to upload</span>
          {current && (
            <span className="text-xs text-indigo-600 truncate max-w-full">{current}</span>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
