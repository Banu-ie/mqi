import { useEffect, useState } from "react";

interface Props { value?: string; file?: File; onChange: (file?: File) => void; accept?: string; }

export default function ImageFileField({ value, file, onChange, accept = ".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif" }: Props) {
  const [preview, setPreview] = useState(value || "");
  useEffect(() => {
    if (!file) { setPreview(value || ""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, value]);
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A2540] mb-2">Şəkil</label>
      <input type="file" accept={accept} onChange={(event) => onChange(event.target.files?.[0])} className="w-full text-sm text-[#6B7A99] file:mr-3 file:rounded-lg file:border-0 file:bg-[#EEF3FD] file:px-4 file:py-2 file:font-medium file:text-[#3B6FE0]" />
      {file && <p className="mt-2 text-xs text-[#6B7A99]">Seçilmiş fayl: {file.name}</p>}
      {preview && <img src={preview} alt="Seçilmiş şəkil önizləməsi" className="mt-3 h-32 w-full rounded-xl object-cover" />}
    </div>
  );
}
