import { useCallback, useRef, useState } from "react";

export type AiMessage = { role: "user" | "assistant"; content: string };

export async function streamAi(
  feature: string,
  messages: AiMessage[],
  onDelta: (fullText: string) => void,
  signal?: AbortSignal,
) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feature, messages }),
    signal,
  });

  if (!response.ok || !response.body) {
    const message = (await response.text().catch(() => "")) || "The AI request failed. Please try again.";
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onDelta(text);
  }
  return text;
}

/** Single-shot generator used by the Email, Planner and Research tools. */
export function useAiGenerator(feature: string) {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (prompt: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      setOutput("");
      try {
        await streamAi(feature, [{ role: "user", content: prompt }], setOutput, controller.signal);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError((err as Error).message);
      } finally {
        if (abortRef.current === controller) setLoading(false);
      }
    },
    [feature],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  return { output, setOutput, loading, error, run, stop };
}
