# AI Image Generation Studio

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Prompt Bank: save, label, and reuse prompts stored in backend
- Reference Image Upload: two upload slots for reference images (stored via blob-storage)
- Prompt Section: text area to compose the generation prompt, with ability to insert from prompt bank
- Output Section: displays generated image result with a download button
- HTTP outcall to external image generation API (using http-outcalls component)

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: prompt bank CRUD (save/list/delete named prompts), store reference image blob IDs, store generation history
2. Use blob-storage for reference image uploads
3. Use http-outcalls to call image generation API from backend
4. Frontend: four-panel layout -- Prompt Bank sidebar, Reference Image uploads, Prompt input, Output with download
