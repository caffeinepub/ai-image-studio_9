import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddPrompt,
  useDeletePrompt,
  useGetAllPrompts,
} from "@/hooks/useQueries";
import { BookOpen, ChevronRight, Plus, Sparkles, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface PromptBankProps {
  currentPrompt: string;
  onInsert: (content: string) => void;
}

export function PromptBank({ currentPrompt, onInsert }: PromptBankProps) {
  const [newTitle, setNewTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: prompts = [], isLoading } = useGetAllPrompts();
  const addPrompt = useAddPrompt();
  const deletePrompt = useDeletePrompt();

  const handleSave = async () => {
    if (!currentPrompt.trim()) {
      toast.error("Write a prompt first before saving.");
      return;
    }
    if (!newTitle.trim()) {
      toast.error("Enter a title for the prompt.");
      return;
    }
    const id = crypto.randomUUID();
    try {
      await addPrompt.mutateAsync({
        id,
        title: newTitle.trim(),
        content: currentPrompt.trim(),
      });
      setNewTitle("");
      setIsSaving(false);
      toast.success("Prompt saved to bank.");
    } catch {
      toast.error("Failed to save prompt.");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deletePrompt.mutateAsync(id);
      toast.success("Prompt removed.");
    } catch {
      toast.error("Failed to delete prompt.");
    }
  };

  return (
    <div
      className="studio-panel h-full flex flex-col"
      data-ocid="prompt_bank.panel"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-accent">
          <BookOpen className="w-3.5 h-3.5 text-accent-foreground" />
        </div>
        <h2 className="font-display text-sm font-semibold text-foreground tracking-wide uppercase">
          Prompt Bank
        </h2>
        <span className="ml-auto text-xs text-muted-foreground font-body">
          {prompts.length}
        </span>
      </div>

      {/* Save area */}
      <div className="px-3 py-3 border-b border-border space-y-2">
        {isSaving ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Input
              placeholder="Prompt title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="h-8 text-xs bg-input border-border focus:border-primary"
              data-ocid="prompt_bank.input"
            />
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="h-7 text-xs flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSave}
                disabled={addPrompt.isPending}
                data-ocid="prompt_bank.save_button"
              >
                {addPrompt.isPending ? "Saving…" : "Save"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setIsSaving(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 gap-1.5"
            onClick={() => setIsSaving(true)}
            data-ocid="prompt_bank.save_button"
          >
            <Plus className="w-3.5 h-3.5" />
            Save current prompt
          </Button>
        )}
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            ["sk1", "sk2", "sk3"].map((k) => (
              <Skeleton key={k} className="h-12 w-full rounded-lg" />
            ))
          ) : prompts.length === 0 ? (
            <div
              className="py-10 text-center space-y-2"
              data-ocid="prompt_bank.empty_state"
            >
              <Sparkles className="w-6 h-6 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">
                No saved prompts yet.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {prompts.map((prompt, idx) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent group flex items-center gap-2 transition-colors"
                    onClick={() => onInsert(prompt.content)}
                    data-ocid={`prompt_bank.item.${idx + 1}`}
                  >
                    <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {prompt.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {prompt.content}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
                      onClick={(e) => handleDelete(prompt.id, e)}
                      data-ocid={`prompt_bank.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
