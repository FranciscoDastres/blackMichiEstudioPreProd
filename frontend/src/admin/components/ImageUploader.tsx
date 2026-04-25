// admin/components/ImageUploader.tsx
import { useState } from "react";

interface ImageUploaderProps {
    onFileSelect: (file: File) => void;
    initialImage?: string;
}

export default function ImageUploader({ onFileSelect, initialImage }: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(initialImage || null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            onFileSelect(file);
        }
    };

    return (
        <div className="flex flex-col items-start gap-2">
            {preview && (
                <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border border-border"
                />
            )}
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
        </div>
    );
}
