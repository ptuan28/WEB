import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImageCapture({ onImage, label = "Đính kèm ảnh" }) {
  const [preview, setPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);

  const uploadToBase44 = async (dataUrl) => {
    setUploading(true);
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    const res = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);
    return res.file_url;
  };

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

  const capturePhoto = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setPreview(dataUrl);
    stopCamera();
    const url = await uploadToBase44(dataUrl);
    onImage(url);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      setPreview(ev.target.result);
      const url = await uploadToBase44(ev.target.result);
      onImage(url);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setPreview(null);
    onImage(null);
  };

  return