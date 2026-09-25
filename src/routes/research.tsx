import { createFileRoute } from "@tanstack/react-router";
import { BookOpenText, Sparkles } from "lucide-react";
import { useState } from "react";

import { AiOutput } from "@/components/ai-output";
import { AppLayout } from "@/components/app-layout";
import { Button, Card, EmptyState, Field, TextArea, TextInput, SectionTitle } from "@/components/ui-kit";
import { useAiGenerator } from "@/lib/use-ai";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AXON" },
      {
        name: "description",
        content: "Summarise a topic, link or pasted article into key insights and practical recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant — AXON" },
      {
        property: "og:description",
        content: "Clear summaries, key insights and practical recommendations from any topic or article.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [url, setUrl] = useState("");
  const [article, setArticle] = useState("");
  const { output, setOutput, loading, error, run } = useAiGenerator("research");

  const ready = Boolean(topic.trim() || url.trim() || article.trim());

  const generate = () => {
    if (!ready || loading) return;
    run(
      `Research request.\nTopic: ${topic.trim() || "not given"}\nSource URL: ${url.trim() || "not given"}\nPasted article text:\n"""${article.trim() || "not given"}"""`,
    );
  };

  return (
    <AppLayout title="AI Research Assistant" description="Turn any topic or article into usable insight.">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card>
          <SectionTitle title="What should AXON research?" hint="Fill in any one — or combine all three." />
          <div className="space-y-4">
            <Field label="Topic">
              <TextInput
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Hybrid work policies in 2026"
              />
            </Field>
            <Field label="Source URL" hint="Optional — paste the article text below for the most accurate summary.">
              <TextInput
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
              />
            </Field>
            <Field label="Article text">
              <TextArea
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="Paste the full article or report text here…"
                className="min-h-44"
              />
            </Field>
            <Button onClick={generate} disabled={!ready || loading} className="w-full">
              <Sparkles className="size-4" />
              {loading ? "Analysing…" : "Run research"}
            </Button>
          </div>
        </Card>

        <Card>
          <AiOutput
            title="Research brief"
            value={output}
            onChange={setOutput}
            loading={loading}
            error={error}
            empty={
              <EmptyState
                icon={<BookOpenText className="size-5" />}
                title="Nothing analysed yet"
                body="Enter a topic, paste a link or drop in article text and AXON will return a summary, insights and recommendations."
              />
            }
          />
        </Card>
      </div>
    </AppLayout>
  );
}
