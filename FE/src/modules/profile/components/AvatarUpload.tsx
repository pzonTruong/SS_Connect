import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, Camera, ZoomIn, RotateCw } from 'lucide-react';
import Cropper, { type Point, type Area } from 'react-easy-crop';
import { toast } from 'sonner';
import { profileApi } from '@/modules/profile/api/profile.api';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { getCroppedImg } from '@/shared/lib/cropImage';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userInitials?: string;
  onUploadSuccess: (newUrl: string) => void;
}

export const AvatarUpload = ({ currentAvatarUrl, userInitials = '??', onUploadSuccess }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentAvatarUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  // Crop Modal state
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  // Keep preview in sync if parent re-fetches user data
  useEffect(() => {
    setPreviewUrl(currentAvatarUrl);
  }, [currentAvatarUrl]);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image file must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input value so re-selecting the same file triggers onChange
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSaveCrop = async () => {
    if (!selectedImageSrc || !croppedAreaPixels) return;

    setUploading(true);
    try {
      const croppedFile = await getCroppedImg(selectedImageSrc, croppedAreaPixels);
      const res = await profileApi.uploadAvatar(croppedFile);
      const newUrl = (res.data as { avatarUrl: string }).avatarUrl;

      setPreviewUrl(newUrl);
      onUploadSuccess(newUrl);
      setIsCropOpen(false);
      setSelectedImageSrc(null);
      toast.success('Avatar updated successfully.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-24 ring-2 ring-border transition group-hover:ring-primary">
          <AvatarImage src={previewUrl} alt="Profile avatar" />
          <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
        </Avatar>

        {/* Overlay */}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-white" />
          ) : (
            <Camera className="size-6 text-white" />
          )}
        </span>

        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
            <Loader2 className="size-6 animate-spin text-white" />
          </span>
        )}
      </button>

      <p className="text-xs text-muted-foreground">Click to upload and crop avatar</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Interactive Crop Modal */}
      <Dialog open={isCropOpen} onOpenChange={(open) => !uploading && setIsCropOpen(open)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Crop Your Avatar</DialogTitle>
          </DialogHeader>

          <div className="relative h-64 w-full rounded-lg overflow-hidden bg-slate-900 mt-2">
            {selectedImageSrc && (
              <Cropper
                image={selectedImageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          {/* Zoom and Rotate Controls */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-3">
              <ZoomIn className="size-4 text-muted-foreground shrink-0" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="flex items-center gap-1.5"
              >
                <RotateCw className="size-3.5" />
                Rotate 90°
              </Button>

              <span className="text-xs text-muted-foreground">Drag to reposition</span>
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCropOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveCrop}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Save & Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

