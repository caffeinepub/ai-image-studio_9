import { ImagePlus, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";

interface RefSlot {
  preview: string | null;
}

interface ReferenceImagesProps {
  slots: [RefSlot, RefSlot];
  onUpload: (index: 0 | 1, file: File) => void;
  onRemove: (index: 0 | 1) => void;
}

function UploadSlot({
  slot,
  index,
  onUpload,
  onRemove,
}: {
  slot: RefSlot;
  index: 0 | 1;
  onUpload: (index: 0 | 1, file: File) => void;
  onRemove: (index: 0 | 1) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const slotNum = index + 1;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(index, file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) onUpload(index, file);
  };

  return (
    <div className="flex-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        data-ocid={`ref_image.upload_button.${slotNum}`}
      />
      <button
        type="button"
        className="relative group w-full h-44 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden text-left"
        onClick={() => {
          if (!slot.preview) inputRef.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        data-ocid={`ref_image.dropzone.${slotNum}`}
      >
        {slot.preview ? (
          <>
            <img
              src={slot.preview}
              alt={`Reference ${slotNum}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                className="p-2 rounded-lg bg-card border border-border text-foreground hover:border-primary/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg bg-destructive/20 border border-destructive/30 text-destructive hover:bg-destructive/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute top-2 left-2">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-background/80 text-muted-foreground border border-border">
                REF {slotNum}
              </span>
            </div>
          </>
        ) : (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <ImagePlus className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-foreground">
                Reference {slotNum}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Drop or click to upload
              </p>
            </div>
          </motion.div>
        )}
      </button>
    </div>
  );
}

export function ReferenceImages({
  slots,
  onUpload,
  onRemove,
}: ReferenceImagesProps) {
  return (
    <div className="studio-panel p-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xs font-display font-semibold uppercase tracking-widest text-muted-foreground">
          Reference Images
        </h3>
        <span className="text-[10px] text-muted-foreground/50 font-body">
          {slots.filter((s) => s.preview).length} / 2 uploaded
        </span>
      </div>
      <div className="flex gap-3">
        {(slots as RefSlot[]).map((slot, i) => (
          <UploadSlot
            key={i === 0 ? "slot-1" : "slot-2"}
            slot={slot}
            index={i as 0 | 1}
            onUpload={onUpload}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
