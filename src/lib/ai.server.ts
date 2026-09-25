import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const DISCLAIMER_RULE =
  "Never invent facts about the user's company or contacts. Keep output professional, concise and immediately usable.";

const SYSTEM_PROMPTS: Record<string, string> = {
  email: `You are AXON, an expert workplace communication assistant. Write a complete, ready-to-send email in markdown.
Start with a line "Subject: <clear subject that states the purpose>", then a blank line, then the email body with greeting, body paragraphs and sign-off.
Match the requested audience and tone exactly. Keep it under 250 words unless more detail is clearly required. Use [Name] style placeholders only where information is genuinely unknown. ${DISCLAIMER_RULE}`,
  planner: `You are AXON, an expert productivity planner. Build a realistic schedule in markdown.
Output sections in this order:
## Schedule — a markdown table with columns Time | Task | Priority. Respect the stated working hours, insert a 15-minute break after roughly every 90 minutes of focused work, and place high-priority and deadline-bound work in peak-focus slots.
## Conflicts & Overload — flag anything that does not fit or collides, and for each say clearly whether to MOVE, DELEGATE or ELIMINATE it, with one short reason.
## Optimisation Tips — 3 to 5 short bullets on time optimisation.
Be concise and scannable; no filler prose. ${DISCLAIMER_RULE}`,
  research: `You are AXON, an expert research analyst. Analyse the supplied topic, URL or article text and output markdown with exactly these sections:
## Summary — a tight 4-6 sentence overview.
## Key Insights — 4-6 bullets.
## Important Points — 4-6 bullets of facts, figures or definitions worth remembering.
## Practical Recommendations — 3-5 action-oriented bullets.
If only a URL is supplied and you cannot open it, reason from what is publicly known about that source/topic and say plainly which parts are general knowledge rather than from the page. ${DISCLAIMER_RULE}`,
  chat: `You are AXON, a friendly and sharp AI workplace assistant. Help with workplace questions: communication, meetings, productivity, career, difficult conversations, processes and tools.
Answer directly and specifically, in markdown, using short paragraphs and bullets. Prefer concrete steps, wording examples and templates over generic advice. Ask a clarifying question only when the request is genuinely ambiguous. ${DISCLAIMER_RULE}`,
};

export type AiRequestBody = {
  feature: keyof typeof SYSTEM_PROMPTS | string;
  messages: { role: "user" | "assistant"; content: string }[];
};

export async function handleAi(request: Request): Promise<Response> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return new Response("AI is not configured yet.", { status: 500 });
  }

  let body: AiRequestBody;
  try {
    body = (await request.json()) as AiRequestBody;
  } catch {
    return new Response("Invalid request.", { status: 400 });
  }

  const system = SYSTEM_PROMPTS[body.feature];
  if (!system || !Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response("Invalid request.", { status: 400 });
  }

  const messages: ModelMessage[] = body.messages
    .filter((m) => typeof m.content === "string" && m.content.trim().length > 0)
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    system,
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const iterator = result.textStream[Symbol.asyncIterator]();
  let first: IteratorResult<string>;
  try {
    first = await iterator.next();
  } catch (error) {
    return errorResponse(error);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!first.done) controller.enqueue(encoder.encode(first.value));
        while (true) {
          const chunk = await iterator.next();
          if (chunk.done) break;
          controller.enqueue(encoder.encode(chunk.value));
        }
      } catch (error) {
        controller.enqueue(encoder.encode(`\n\n[AXON] ${readableError(error).message}`));
      }
      controller.close();
    },
    cancel: () => void iterator.return?.(),
  });

  const headers = new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  const runId = runIdFetch.getRunId();
  if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);

  return new Response(stream, { headers });
}

function readableError(error: unknown): { status: number; message: string } {
  const status = Number((error as { statusCode?: number; status?: number })?.statusCode ?? (error as { status?: number })?.status ?? 500);
  if (status === 402) {
    return { status, message: "AI credits have run out. Add credits in your workspace to continue." };
  }
  if (status === 429) {
    return { status, message: "Too many requests right now — please try again in a moment." };
  }
  if (status === 403) {
    return { status, message: "This AI request was blocked. Please adjust the request and try again." };
  }
  return { status, message: "The AI request failed. Please try again." };
}

function errorResponse(error: unknown) {
  const { status, message } = readableError(error);
  console.error("AXON AI error", error);
  return new Response(message, { status });
}
