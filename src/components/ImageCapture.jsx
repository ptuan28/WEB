import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

export default function ImageCapture({ onImage, label = "Đính kèm ảnh" }) {
  const [preview, setPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);

  const startCamera = async () => {
    setShowCamera(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setPreview(dataUrl);
    onImage(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      onImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setPreview(null);
    onImage(null);
  };

  return (
    <div className="space-y-2">
      {!preview && !showCamera && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-xl bg-yellow-300 font-bold text-sm hover:bg-yellow-400 transition-all"
          >
            <Camera className="w-4 h-4" /> Chụp ảnh 📸
          </button>
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-xl bg-pink-300 font-bold text-sm hover:bg-pink-400 transition-all"
          >
            <Upload className="w-4 h-4" /> Upload ảnh 🖼️
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>
      )}

      {showCamera && (
        <div className="relative border-2 border-black rounded-xl overflow-hidden">
          <video ref={videoRef} autoPlay className="w-full max-h-48 object-cover" />
          <div className="flex gap-2 p-2 bg-black/70">
            <button type="button" onClick={capturePhoto} className="flex-1 bg-yellow-400 text-black font-bold py-2 rounded-lg text-sm">
              📸 Chụp!
            </button>
            <button type="button" onClick={stopCamera} className="px-3 bg-red-400 text-white font-bold py-2 rounded-lg text-sm">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="relative inline-block">
          <img src={preview} alt="preview" className="w-32 h-32 object-cover border-2 border-black rounded-xl" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-black"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}