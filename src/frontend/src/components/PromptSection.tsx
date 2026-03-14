import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface PromptSectionProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  onGenerate: (prompt: string, negativePrompt: string) => void;
  isGenerating: boolean;
  error: string | null;
}

export function PromptSection({
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  error,
}: PromptSectionProps) {
  const [negativePrompt, setNegativePrompt] = useState("");
  const [showNegative, setShowNegative] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onGenerate(prompt, negativePrompt);
  };

  return (
    <div
      className={`studio-panel p-4 space-y-3 ${isGenerating ? "generating" : ""}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-display font-semibold uppercase tracking-widest text-muted-foreground">
          Prompt
        </h3>
        <button
          type="button"
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setShowNegative(!showNegative)}
        >
          {showNegative ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          Negative prompt
        </button>
      </div>

      <Textarea
        placeholder="Describe your image in vivid detail… A lone astronaut on a crimson desert planet at golden hour, dramatic shadows, photorealistic…"
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        className="min-h-[120px] resize-none text-sm bg-input border-border focus:border-primary/60 placeholder:text-muted-foreground/40 font-body leading-relaxed"
        data-ocid="prompt.textarea"
      />

      <AnimatePresence>
        {showNegative && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Textarea
              placeholder="Things to avoid… blurry, low quality, distorted, watermark, text…"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="min-h-[72px] resize-none text-sm bg-input border-border focus:border-destructive/40 placeholder:text-muted-foreground/40 font-body"
              data-ocid="prompt.negative_textarea"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div
          className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs"
          data-ocid="prompt.error_state"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button
        className="w-full h-11 font-display font-semibold text-sm tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 gap-2 transition-all"
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        data-ocid="prompt.submit_button"
      >
        {isGenerating ? (
          <>
            <Loader2
              className="w-4 h-4 animate-spin"
              data-ocid="prompt.loading_state"
            />
            Generating…
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Generate Image
          </>
        )}
      </Button>
    </div>
  );
}
