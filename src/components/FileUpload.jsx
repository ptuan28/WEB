import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Paperclip, X, Loader2 } from 'lucide-react';

export default function FileUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setFileName(file.name);
    const res = await base44.integrations.Core.UploadFile({ file });
    onUpload({ url: res.file_url, name: file.name });
    setUploading(false);
  };

  const handleRemove = () => {
    setFileName(null);
    onUpload(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.xlsx,.ppt,.pptx"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload-answer"
      />
      {!fileName ? (
        <label
          htmlFor="file-upload-answer"
          className="flex items-center gap-2 cursor-pointer px-4 py-2 border-2 border-dashed border-black rounded-2xl text-sm font-grotesk font-semibold hover:bg-yellow-50 transition-colors"
        >
          <Paperclip className="w-4 h-4" />
          Đính kèm file
        </label>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 border-2 border-black rounded-2xl text-sm font-grotesk">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
          <span className="max-w-[180px] truncate font-semibold">{fileName}</span>
          {!uploading && (
            <button type="button" onClick={handleRemove} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
