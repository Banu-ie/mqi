import { useEffect, useState } from "react";
import { resolveMediaUrl } from "../../api/client";

/** Mirrors MAX_PRODUCT_IMAGES on the server, which rejects anything above it. */
export const MAX_PRODUCT_IMAGES = 10;

const ACCEPT = ".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif";

interface Props {
  /** Existing pictures to keep, in display order. */
  images: string[];
  /** Newly chosen files; the server appends these after the kept ones. */
  files: File[];
  onImagesChange: (images: string[]) => void;
  onFilesChange: (files: File[]) => void;
}

const tileClasses =
  "relative w-24 h-24 rounded-xl overflow-hidden border border-[#E4E9F4] bg-[#F0F4FE] group";
const iconButtonClasses =
  "w-6 h-6 rounded-md bg-white/90 !text-[#1A2540] text-xs leading-none flex items-center justify-center shadow-sm hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed";

export default function ProductImagesField({ images, files, onImagesChange, onFilesChange }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const total = images.length + files.length;
  const remaining = MAX_PRODUCT_IMAGES - total;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onImagesChange(next);
  };

  const addFiles = (chosen: FileList | null) => {
    if (!chosen) return;
    onFilesChange([...files, ...Array.from(chosen).slice(0, Math.max(0, remaining))]);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#1A2540] mb-2">
        Şəkillər{" "}
        <span className="font-normal text-[#6B7A99]">
          ({total}/{MAX_PRODUCT_IMAGES} — birinci şəkil örtükdür)
        </span>
      </label>

      {total > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className={tileClasses}>
              <img src={resolveMediaUrl(image)} alt="" className="w-full h-full object-cover" />
              {index === 0 && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#3B6FE0] text-white text-[10px] font-semibold">
                  Örtük
                </span>
              )}
              <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Sola daşı"
                  className={iconButtonClasses}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => onImagesChange(images.filter((_, i) => i !== index))}
                  aria-label="Şəkli sil"
                  className={`${iconButtonClasses} !text-red-500`}
                >
                  ×
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === images.length - 1}
                  aria-label="Sağa daşı"
                  className={iconButtonClasses}
                >
                  ›
                </button>
              </div>
            </div>
          ))}

          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className={`${tileClasses} border-dashed`}>
              {previews[index] && (
                <img src={previews[index]} alt="" className="w-full h-full object-cover" />
              )}
              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#7C5CFC] text-white text-[10px] font-semibold">
                Yeni
              </span>
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                aria-label="Seçimi ləğv et"
                className={`${iconButtonClasses} !text-red-500 absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        accept={ACCEPT}
        multiple
        disabled={remaining <= 0}
        onChange={(event) => {
          addFiles(event.target.files);
          // Let the same file be picked again after it is removed.
          event.target.value = "";
        }}
        className="w-full text-sm text-[#6B7A99] file:mr-3 file:rounded-lg file:border-0 file:bg-[#EEF3FD] file:px-4 file:py-2 file:font-medium file:text-[#3B6FE0] disabled:opacity-50"
      />

      <p className="mt-2 text-xs text-[#6B7A99]">
        {remaining > 0
          ? `Daha ${remaining} şəkil əlavə edə bilərsiniz. Sıranı ‹ və › düymələri ilə dəyişin.`
          : "Maksimum şəkil sayına çatdınız."}
      </p>
    </div>
  );
}
