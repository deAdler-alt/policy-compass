/**
 * Hugging Face token for Inference API (embeddings). Free tier available at huggingface.co/settings/tokens
 */
export function getHfToken(): string | undefined {
  const t = process.env.HF_TOKEN?.trim() || process.env.HUGGING_FACE_HUB_TOKEN?.trim();
  return t || undefined;
}

export function isEmbeddingsDisabled(): boolean {
  return process.env.DISABLE_EMBEDDINGS === "1" || process.env.DISABLE_EMBEDDINGS === "true";
}
