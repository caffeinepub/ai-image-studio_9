import type { GenerationRecord } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useClearHistory, useGetGenerationHistory } from "@/hooks/useQueries";
import { Clock, Download, ImageOff, Sparkles, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OutputSectionProps {
  currentImageUrl: string | null;
  isGenerating: boolean;
}

export function OutputSection({
  currentImageUrl,
  isGenerating,
}: OutputSectionProps) {
  const { data: history = [], isLoading } = useGetGenerationHistory();
  const clearHistory = useClearHistory();
  const [selectedRecord, setSelectedRecord] = useState<GenerationRecord | null>(
    null,
  );

  const displayUrl = selectedRecord?.resultUrl ?? currentImageUrl;

  const handleDownload = async () => {
    if (!displayUrl) return;
    try {
      const response = await fetch(displayUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded.");
    } catch {
      window.open(displayUrl, "_blank");
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory.mutateAsync();
      setSelectedRecord(null);
      toast.success("History cleared.");
    } catch {
      toast.error("Failed to clear history.");
    }
  };

  return (
    <div
      className="studio-panel flex flex-col overflow-hidden"
      data-ocid="output.panel"
    >
      {/* Main output canvas */}
      <div
        className="relative bg-muted/30 border-b border-border"
        style={{ minHeight: "280px" }}
        data-ocid="output.canvas_target"
      >
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 p-4"
              data-ocid="output.loading_state"
            >
              <Skeleton className="w-full h-full rounded-lg" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                <p className="text-xs text-muted-foreground font-body">
                  Generating your image…
                </p>
              </div>
            </motion.div>
          ) : displayUrl ? (
            <motion.div
              key={displayUrl}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative"
            >
              <img
                src={displayUrl}
                alt="Generated output"
                className="w-full object-contain max-h-[400px] rounded-t-xl"
              />
              <div className="absolute top-3 right-3">
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary gap-1.5 transition-all"
                  onClick={handleDownload}
                  data-ocid="output.primary_button"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              data-ocid="output.empty_state"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/50 flex items-center justify-center">
                <ImageOff className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  No image yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Write a prompt and hit Generate
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <h3 className="text-xs font-display font-semibold uppercase tracking-widest text-muted-foreground">
            History
          </h3>
          <span className="text-[10px] text-muted-foreground/50">
            {history.length}
          </span>
        </div>
        {history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive gap-1"
                data-ocid="output.delete_button"
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="output.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear generation history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {history.length} generation
                  records. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="output.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleClearHistory}
                  data-ocid="output.confirm_button"
                >
                  Clear history
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <ScrollArea className="max-h-48">
        <div className="p-2 space-y-1">
          {isLoading ? (
            ["sk1", "sk2"].map((k) => (
              <Skeleton key={k} className="h-14 w-full rounded-lg" />
            ))
          ) : history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-5">
              No generation history yet.
            </p>
          ) : (
            <AnimatePresence>
              {[...history]
                .sort((a, b) => Number(b.timestamp - a.timestamp))
                .map((record, idx) => (
                  <motion.button
                    key={record.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    type="button"
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                      selectedRecord?.id === record.id
                        ? "bg-accent border border-primary/20"
                        : "hover:bg-accent/60"
                    }`}
                    onClick={() =>
                      setSelectedRecord(
                        selectedRecord?.id === record.id ? null : record,
                      )
                    }
                    data-ocid={`output.item.${idx + 1}`}
                  >
                    {record.resultUrl ? (
                      <img
                        src={record.resultUrl}
                        alt=""
                        className="w-10 h-10 rounded-md object-cover shrink-0 border border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <ImageOff className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">
                        {record.prompt}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatTimestamp(record.timestamp)}
                      </p>
                    </div>
                  </motion.button>
                ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
