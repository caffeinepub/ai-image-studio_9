import { ExternalBlob } from "@/backend";
import { OutputSection } from "@/components/OutputSection";
import { PromptBank } from "@/components/PromptBank";
import { PromptSection } from "@/components/PromptSection";
import { ReferenceImages } from "@/components/ReferenceImages";
import { Toaster } from "@/components/ui/sonner";
import { useActor } from "@/hooks/useActor";
import { Cpu, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface RefSlot {
  preview: string | null;
  blob: ExternalBlob | null;
}

const defaultSlots: [RefSlot, RefSlot] = [
  { preview: null, blob: null },
  { preview: null, blob: null },
];

export default function App() {
  const { actor } = useActor();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [refSlots, setRefSlots] = useState<[RefSlot, RefSlot]>(defaultSlots);

  const handleRefUpload = (index: 0 | 1, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const bytes = new Uint8Array(e.target!.result as ArrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes);
      setRefSlots((prev) => {
        const next: [RefSlot, RefSlot] = [...prev] as [RefSlot, RefSlot];
        // revoke old preview
        if (next[index].preview) URL.revokeObjectURL(next[index].preview!);
        next[index] = { preview: previewUrl, blob };
        return next;
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRefRemove = (index: 0 | 1) => {
    setRefSlots((prev) => {
      const next: [RefSlot, RefSlot] = [...prev] as [RefSlot, RefSlot];
      if (next[index].preview) URL.revokeObjectURL(next[index].preview!);
      next[index] = { preview: null, blob: null };
      return next;
    });
  };

  const handleGenerate = async (promptText: string, negativePrompt: string) => {
    if (!actor) {
      toast.error("Backend not ready yet.");
      return;
    }
    if (!promptText.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    const referenceImages = refSlots
      .filter((s) => s.blob !== null)
      .map((s) => s.blob!);

    try {
      const resultUrl = await actor.postGenerateImageAPI(
        "https://api.example.com/generate",
        promptText,
        negativePrompt || null,
        referenceImages,
      );

      setOutputUrl(resultUrl);

      // save to history in background
      actor
        .generateImage(
          promptText,
          negativePrompt || null,
          referenceImages,
          null,
          resultUrl,
        )
        .catch(() => {});

      toast.success("Image generated!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setGenerationError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "bg-card border-border text-foreground",
          },
        }}
      />

      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <motion.div
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base tracking-tight text-foreground">
              Studio
              <span className="text-primary ml-1">AI</span>
            </span>
          </motion.div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent border border-border text-[10px] font-medium text-accent-foreground">
              <Cpu className="w-3 h-3" />
              <span>Image Generation</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-5">
        <div className="flex gap-5 h-full">
          {/* Left sidebar — Prompt Bank */}
          <motion.aside
            className="w-64 shrink-0 h-[calc(100vh-7rem)] sticky top-[4.5rem]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PromptBank
              currentPrompt={prompt}
              onInsert={(content) => {
                setPrompt(content);
                toast.success("Prompt inserted.");
              }}
            />
          </motion.aside>

          {/* Center column */}
          <motion.div
            className="flex-1 min-w-0 space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <ReferenceImages
              slots={refSlots}
              onUpload={handleRefUpload}
              onRemove={handleRefRemove}
            />
            <PromptSection
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              error={generationError}
            />
          </motion.div>

          {/* Right column — Output */}
          <motion.div
            className="w-80 shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <OutputSection
              currentImageUrl={outputUrl}
              isGenerating={isGenerating}
            />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 mt-6">
        <p className="text-center text-[11px] text-muted-foreground/60 font-body">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/70 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
