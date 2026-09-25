import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, MessagesSquare, Pencil, RotateCcw, Send, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { AppLayout } from "@/components/app-layout";
import { Button, Card, Disclaimer } from "@/components/ui-kit";
import { streamAi, type AiMessage } from "@/lib/use-ai";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Workplace Chat — AXON" },
      {
        name: "description",
        content: "Chat with an AI workplace assistant about meetings, communication, productivity and career questions.",
      },
      { property: "og:title", content: "AI Workplace Chat — AXON" },
      {
        property: "og:description",
        content: "Ask workplace questions and get specific, practical answers in seconds.",
      },
    ],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "How do I tell my manager I'm at capacity?",
  "Write an agenda for a 30-minute project kickoff.",
  "How should I respond to a client who missed a deadline?",
  "Give me a framework for prioritising a messy backlog.",
];

function ChatPage() {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted" | "streaming">("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || status !== "idle") return;
      const history: AiMessage[] = [...messages, { role: "user", content }];
      setMessages(history);
      setInput("");
      setError(null);
      setStatus("submitted");

      const controller = new AbortController();
      abortRef.current = controller;
      let started = false;
      try {
        await streamAi(
          "chat",
          history,
          (full) => {
            if (!started) {
              started = true;
              setStatus("streaming");
              setMessages([...history, { role: "assistant", content: full }]);
              return;
            }
            setMessages([...history, { role: "assistant", content: full }]);
          },
          controller.signal,
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError((err as Error).message);
      } finally {
        setStatus("idle");
      }
    },
    [messages, status],
  );

  return (
    <AppLayout title="AI Workplace Chat" description="Ask anything about work — get a specific answer.">
      <Card className="flex h-[calc(100vh-13rem)] flex-col p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="text-sm font-semibold">Conversation</p>
          <Button
            variant="ghost"
            className="px-3 py-1.5 text-xs"
            onClick={() => {
              abortRef.current?.abort();
              setMessages([]);
              setError(null);
            }}
            disabled={messages.length === 0}
          >
            <RotateCcw className="size-3.5" />
            New conversation
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <MessagesSquare className="size-6" />
              </span>
              <p className="font-semibold">Start a conversation</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Ask about emails, meetings, prioritisation, feedback or anything else at work.
              </p>
              <div className="mt-5 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm transition hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    {m.content}
                  </p>
                </div>
              ) : (
                <AssistantMessage
                  key={i}
                  content={m.content}
                  onChange={(next) =>
                    setMessages((prev) => prev.map((msg, idx) => (idx === i ? { ...msg, content: next } : msg)))
                  }
                />
              ),
            )
          )}

          {status === "submitted" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2 animate-bounce rounded-full bg-primary" />
              <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
              <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
              AXON is thinking…
            </div>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-4 sm:px-6">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask a workplace question…"
              className="max-h-40 min-h-11 flex-1 resize-y rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
            />
            {status === "idle" ? (
              <Button onClick={() => send(input)} disabled={!input.trim()} className="h-11 px-4">
                <Send className="size-4" />
                Send
              </Button>
            ) : (
              <Button variant="outline" onClick={() => abortRef.current?.abort()} className="h-11 px-4">
                <Square className="size-4" />
                Stop
              </Button>
            )}
          </div>
          <Disclaimer className="mt-3" />
        </div>
      </Card>
    </AppLayout>
  );
}

function AssistantMessage({ content, onChange }: { content: string; onChange: (next: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div className="group max-w-[92%] space-y-2">
      {editing ? (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-40 w-full resize-y rounded-xl border border-input bg-card p-3 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
        />
      ) : (
        <div className="prose-axon text-sm">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
      <div className="flex gap-1 opacity-70 transition group-hover:opacity-100">
        <button
          onClick={() => setEditing((v) => !v)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-secondary"
        >
          <Pencil className="size-3.5" />
          {editing ? "Done" : "Edit"}
        </button>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-secondary"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
