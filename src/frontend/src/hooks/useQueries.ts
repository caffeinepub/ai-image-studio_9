import type { ExternalBlob } from "@/backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetAllPrompts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPrompts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGenerationHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGenerationHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPrompt() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
    }: {
      id: string;
      title: string;
      content: string;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.addPrompt(id, title, content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prompts"] }),
  });
}

export function useDeletePrompt() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      await actor.deletePrompt(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prompts"] }),
  });
}

export function useClearHistory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.clearHistory();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] }),
  });
}

export function useGenerateImage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      prompt,
      negativePrompt,
      referenceImages,
    }: {
      prompt: string;
      negativePrompt: string;
      referenceImages: ExternalBlob[];
    }) => {
      if (!actor) throw new Error("No actor");
      const resultUrl = await actor.postGenerateImageAPI(
        "https://api.example.com/generate",
        prompt,
        negativePrompt || null,
        referenceImages,
      );
      await actor.generateImage(
        prompt,
        negativePrompt || null,
        referenceImages,
        null,
        resultUrl,
      );
      return resultUrl;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] }),
  });
}
