import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface http_header {
    value: string;
    name: string;
}
export interface GenerationRecord {
    id: string;
    resultUrl?: string;
    referenceImages: Array<ExternalBlob>;
    timestamp: Time;
    resultBlob?: ExternalBlob;
    prompt: string;
    negativePrompt?: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Prompt {
    id: string;
    title: string;
    content: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface backendInterface {
    addPrompt(id: string, title: string, content: string): Promise<void>;
    clearHistory(): Promise<void>;
    deletePrompt(id: string): Promise<void>;
    generateImage(prompt: string, negativePrompt: string | null, referenceImages: Array<ExternalBlob>, resultBlob: ExternalBlob | null, resultUrl: string | null): Promise<void>;
    getAllPrompts(): Promise<Array<Prompt>>;
    getGenerationHistory(): Promise<Array<GenerationRecord>>;
    getPrompt(id: string): Promise<Prompt>;
    postGenerateImageAPI(url: string, prompt: string, negativePrompt: string | null, referenceImages: Array<ExternalBlob>): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
