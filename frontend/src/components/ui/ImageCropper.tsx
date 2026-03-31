import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import Modal from './Modal';
import Button from './Button';
import { Upload, Crop, Image as ImageIcon } from 'lucide-react';

interface ImageCropperProps {
  value?: File | null;
  previewUrl?: string;
  onChange: (file: File) => void;
  label?: string;
  aspectRatio?: number;
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<File> {
  const image = new window.Image();
  image.src = imageSrc;
  await new Promise<void>((res) => { image.onload = () => res(); });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);

  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.92);
  });
}

export default function ImageCropper({ value, previewUrl, onChange, label = 'Foto', aspectRatio = 1 }: ImageCropperProps) {
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawSrc(reader.result as string);
      setIsOpen(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!rawSrc || !croppedArea) return;
    const file = await getCroppedImg(rawSrc, croppedArea);
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file);
    setIsOpen(false);
  };

  const currentPreview = preview || (value ? URL.createObjectURL(value) : null);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          {currentPreview ? (
            <img src={currentPreview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-300" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Upload className="w-4 h-4" />
            {currentPreview ? 'Trocar foto' : 'Selecionar foto'}
          </button>
          {currentPreview && (
            <button type="button" onClick={() => { setPreview(null); onChange(null as unknown as File); }} className="text-xs text-slate-400 hover:text-red-500 text-left">
              Remover foto
            </button>
          )}
          <p className="text-xs text-slate-400">JPEG, PNG ou WEBP. Máx 5MB.</p>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="hidden" />

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Recortar Imagem"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirm} icon={<Crop className="w-4 h-4" />}>Confirmar recorte</Button>
          </div>
        }
      >
        <div className="relative h-72 bg-slate-900 rounded-xl overflow-hidden">
          {rawSrc && (
            <Cropper
              image={rawSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>
        <div className="mt-4">
          <label className="text-xs text-slate-500 font-medium">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full mt-1 accent-blue-600"
          />
        </div>
      </Modal>
    </div>
  );
}
