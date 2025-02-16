import { ChangeEvent, useRef, useState } from "react";
import { Button } from "./button";
import { Alert, AlertDescription } from "./alert";
import { ImagePlus, X } from "lucide-react";

interface FileUploadProps {
  onChange: (files: string[]) => void;
  value?: string[];
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export function FileUpload({
  onChange,
  value = [],
  accept = "image/*",
  maxFiles = 5,
  maxSize = 5, // 5MB default
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    if (files.length + value.length > maxFiles) {
      setError(`يمكنك رفع ${maxFiles} ملفات كحد أقصى`);
      return;
    }

    const oversizedFiles = files.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`حجم الملف يجب أن لا يتجاوز ${maxSize}MB`);
      return;
    }

    const filePromises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises)
      .then(base64Files => {
        onChange([...value, ...base64Files]);
      })
      .catch(() => {
        setError('حدث خطأ أثناء معالجة الملفات');
      });
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((file, index) => (
          <div key={index} className="relative group">
            <img
              src={file}
              alt={`Uploaded ${index + 1}`}
              className="w-16 h-16 object-cover rounded-md border"
            />
            <button
              type="button"
              onClick={() => removeFile(index)}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < maxFiles && (
          <Button
            type="button"
            variant="outline"
            className="w-16 h-16 flex flex-col items-center justify-center gap-1 text-muted-foreground"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            <span className="text-[10px]">إضافة</span>
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
