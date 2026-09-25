import { Check, Copy, Pencil, Eye } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

import { Button, Disclaimer, OutputSkeleton } from "@/components/ui-kit";

export function AiOutput({
  value,
  onChange,
  loading,
  error,
  empty,
  title = "Result",
}: {
  value: string;
  onChange: (next: string) => void;
  loading: boolean;
  error?: string | null;
  empty: React.ReactNode;
  title?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!value && loading) {
    return (
      <div className="space-y-4">
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="size-2 animate-ping rounded-full bg-primary" />
          AXON is writing your {title.toLowerCase()}…
        </p>
        <OutputSkeleton />
      </div>
    );
  }

  if (!value) return <>{empty}</>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{title}</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing((v) => !v)} className="px-3 py-2">
            {editing ? <Eye className="size-4" /> : <Pencil className="size-4" />}
            {editing ? "Preview" : "Edit"}
          </Button>
          <Button variant="outline" onClick={copy} className="px-3 py-2">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-80 w-full resize-y rounded-xl border border-input bg-card p-4 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
        />
      ) : (
        <div className="prose-axon rounded-xl bg-secondary/40 p-4 text-sm">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      )}

      {loading ? (
        <p className="text-xs font-medium text-primary">Still generating…</p>
      ) : (
        <Disclaimer />
      )}
    </div>
  );
}
