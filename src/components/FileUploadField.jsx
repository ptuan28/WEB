import { useState, useRef } from 'react';
import { FileUp, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FileUploadField({ onFileUploaded, className = '' }) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);

    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      const url = res?.file_url || res?.url || '';
      onFileUploaded?.({ url, name: file.name });
    } catch (err) {
      console.error(err);
      alert('Upload thất bại. Vui lòng thử lại.');
      onFileUploaded?.(null);
      setFileName('');
      if (inputRef.current) inputRef.current.value = '';
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFileName('');
    onFileUploaded?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.xlsx"
        className="hidden"
        onChange={handleChange}
      />

      <div className="flex items-center gap-2">
        {!fileName ? (
          <button
            type="button"
            onClick={handlePick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-black bg-yellow-50 hover:bg-yellow-100 font-lexend text-sm font-black"
          >
            <FileUp className="h-4 w-4" />
            Chọn file
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-1 rounded-2xl border-2 border-black bg-yellow-100 px-3 py-2">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            <span className="text-sm font-grotesk font-semibold truncate">{fileName}</span>
            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="ml-auto text-red-600 hover:text-red-700"
                aria-label="Xóa file"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

