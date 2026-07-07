'use client';

import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Check, Image as ImageIcon } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';

interface AvatarCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
}

export const AvatarCropperModal: React.FC<AvatarCropperModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // Real-time preview
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Helper to load image
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      // Only set crossOrigin if it's an external HTTP URL
      if (url.startsWith('http')) {
        image.setAttribute('crossOrigin', 'anonymous');
      }
      image.src = url;
    });

  // Load image ref once
  React.useEffect(() => {
    if (imageSrc && isOpen) {
      createImage(imageSrc).then(img => {
        imageRef.current = img;
      });
    }
  }, [imageSrc, isOpen]);

  const onCropChange = (crop: { x: number, y: number }) => {
    setCrop(crop);
  };

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
    updatePreview(croppedAreaPixels);
  }, []);

  const updatePreview = (pixels: any) => {
    if (!imageRef.current || !canvasRef.current || !pixels) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = pixels.width;
    canvas.height = pixels.height;

    ctx.drawImage(
      imageRef.current,
      pixels.x,
      pixels.y,
      pixels.width,
      pixels.height,
      0,
      0,
      pixels.width,
      pixels.height
    );
    
    setPreviewUrl(canvas.toDataURL('image/webp'));
  };

  const generateCroppedBlob = async (): Promise<Blob | null> => {
    if (!imageRef.current || !croppedAreaPixels) return null;

    const canvas = document.createElement('canvas');
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    ctx.drawImage(
      imageRef.current,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/webp', 1); // High quality webp
    });
  };

  const handleSave = async () => {
    const blob = await generateCroppedBlob();
    if (blob) {
      onCropComplete(blob);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-4xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Left Side: Cropper */}
        <div className="flex-1 flex flex-col bg-zinc-950 p-6 border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
              Crop Image
            </h3>
            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden shadow-inner">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={setZoom}
            />
          </div>

          <div className="flex items-center gap-4 mt-6">
            <ZoomOut className="w-5 h-5 text-zinc-500 shrink-0" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#D4AF37]"
            />
            <ZoomIn className="w-5 h-5 text-zinc-500 shrink-0" />
          </div>
        </div>

        {/* Right Side: Preview & Actions */}
        <div className="w-full md:w-72 bg-[#0A0A0A] p-6 flex flex-col items-center">
          <div className="w-full mb-8">
            <h4 className="text-sm font-medium text-zinc-400 mb-6 text-center">Live Preview</h4>
            
            <div className="flex flex-col items-center gap-6">
              {/* Large Preview */}
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[rgba(255,255,255,0.1)] shadow-2xl bg-black">
                <canvas ref={canvasRef} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex gap-4">
                {/* Medium Preview */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[rgba(255,255,255,0.1)] bg-black">
                    <img 
                      src={previewUrl} 
                      className="w-full h-full object-cover" 
                      alt="Preview sm" 
                    />
                  </div>
                  <span className="text-[10px] text-zinc-600">48px</span>
                </div>
                
                {/* Small Preview */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[rgba(255,255,255,0.1)] bg-black">
                    <img 
                      src={previewUrl} 
                      className="w-full h-full object-cover" 
                      alt="Preview xs" 
                    />
                  </div>
                  <span className="text-[10px] text-zinc-600">32px</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto w-full space-y-3">
            <MagneticButton onClick={handleSave} variant="primary" className="w-full py-2.5">
              <Check className="w-4 h-4 mr-2" /> Crop & Save
            </MagneticButton>
            <button onClick={onClose} className="w-full py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
