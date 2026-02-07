import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Upload, X } from 'lucide-react';
import { ExternalBlob } from '../../backend';

interface PhotoPickerProps {
  value?: ExternalBlob;
  onChange: (blob: ExternalBlob | undefined) => void;
}

export default function PhotoPicker({ value, onChange }: PhotoPickerProps) {
  const [preview, setPreview] = useState<string | undefined>(value?.getDirectURL());
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);
      
      onChange(blob);
      setPreview(URL.createObjectURL(file));
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    setPreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Profile preview" className="w-32 h-32 rounded-lg object-cover border" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">Upload a profile photo (optional)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
          />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Choose Photo'}
          </Button>
        </div>
      )}
    </div>
  );
}
