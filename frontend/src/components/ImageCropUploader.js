import React, { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Crop, X, Image as ImageIcon } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const ImageCropUploader = ({ 
  onImageUploaded, 
  currentImage = '', 
  aspectRatio = 1, // 1 = square, 16/9 = widescreen, etc.
  label = 'Image',
  circularCrop = false,
  maxWidth = 800,
  maxHeight = 800
}) => {
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [crop, setCrop] = useState({ unit: '%', width: 90, aspect: aspectRatio });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setShowCropDialog(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    
    // Center the crop
    const cropWidth = Math.min(90, (height / width) * 90 * aspectRatio);
    const cropHeight = cropWidth / aspectRatio;
    
    setCrop({
      unit: '%',
      width: cropWidth,
      height: cropHeight,
      x: (100 - cropWidth) / 2,
      y: (100 - cropHeight) / 2,
    });
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Calculate output dimensions
    let outputWidth = completedCrop.width * scaleX;
    let outputHeight = completedCrop.height * scaleY;
    
    // Scale down if too large
    if (outputWidth > maxWidth) {
      const ratio = maxWidth / outputWidth;
      outputWidth = maxWidth;
      outputHeight *= ratio;
    }
    if (outputHeight > maxHeight) {
      const ratio = maxHeight / outputHeight;
      outputHeight = maxHeight;
      outputWidth *= ratio;
    }
    
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputWidth,
      outputHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  }, [completedCrop, maxWidth, maxHeight]);

  const handleUpload = async () => {
    if (!completedCrop) {
      toast.error('Please select a crop area');
      return;
    }

    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg();
      if (!croppedBlob) {
        toast.error('Failed to crop image');
        return;
      }

      const formData = new FormData();
      formData.append('file', croppedBlob, 'cropped-image.jpg');

      const response = await fetch(`${API_URL}/api/images/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        onImageUploaded(data.url);
        toast.success('Image uploaded successfully!');
        setShowCropDialog(false);
        setImageSrc('');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowCropDialog(false);
    setImageSrc('');
    setCompletedCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Current Image Preview */}
      {currentImage && (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
          <img 
            src={currentImage.startsWith('http') ? currentImage : `${API_URL}${currentImage}`} 
            alt="Current" 
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onImageUploaded('')}
            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          className="hidden"
          id={`image-upload-${label.replace(/\s/g, '-')}`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {currentImage ? 'Change Image' : 'Upload Image'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Click to upload and crop your image
      </p>

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="h-5 w-5" />
              Crop Image
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center py-4 max-h-[60vh] overflow-auto">
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                circularCrop={circularCrop}
              >
                <img
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  style={{ maxHeight: '50vh', maxWidth: '100%' }}
                />
              </ReactCrop>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !completedCrop}>
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Upload Cropped Image
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Simplified version for profile pictures (always circular)
export const ProfileImageUploader = ({ onImageUploaded, currentImage = '' }) => {
  return (
    <ImageCropUploader
      onImageUploaded={onImageUploaded}
      currentImage={currentImage}
      aspectRatio={1}
      circularCrop={true}
      label="Profile Picture"
      maxWidth={400}
      maxHeight={400}
    />
  );
};
