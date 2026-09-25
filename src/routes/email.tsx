import { createFileRoute } from "@tanstack/react-router";
import { Mail, Sparkles } from "lucide-react";
import { useState } from "react";

import { AiOutput } from "@/components/ai-output";
import { AppLayout } from "@/components/app-layout";
import { Button, Card, EmptyState, Field, Select, TextArea, SectionTitle } from "@/components/ui-kit";
import { useAiGenerator } from "@/lib/use-ai";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AXON" },
      {
        name: "description",
        content: "Generate a complete, professional work email with the right tone for clients, managers or your team.",
      },
      { property: "og:title", content: "Smart Email Generator — AXON" },
      {
        property: "og:description",
        content: "Generate a complete, professional work email with the right tone in seconds.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("Client");
  const [tone, setTone] = useState("Formal");
  const { output, setOutput, loading, error, run } = useAiGenerator("email");

  const generate = () => {
    if (!purpose.trim() || loading) return;
    run(
      `Write a work email.\nAudience: ${audience}\nTone: ${tone}\nPurpose and details from the sender:\n"""${purpose.trim()}"""`,
    );
  };

  return (
    <AppLayout title="Smart Email Generator" description="Professional emails, written in your tone.">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card>
          <SectionTitle title="Email brief" hint="The more context you give, the sharper the draft." />
          <div className="space-y-4">
            <Field
              label="What is the email about?"
              hint="e.g. Ask the client for a two-week extension on the website launch because of late content."
            >
              <TextArea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe the purpose, key points and any deadline or names to include…"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Audience">
                <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
                  <option>Client</option>
                  <option>Manager</option>
                  <option>Team</option>
                  <option>HR / Recruiter</option>
                  <option>External partner</option>
                  <option>Whole company</option>
                </Select>
              </Field>
              <Field label="Tone">
                <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option>Formal</option>
                  <option>Friendly</option>
                  <option>Persuasive</option>
                  <option>Assertive</option>
                  <option>Casual</option>
                  <option>Apologetic</option>
                  <option>Enthusiastic</option>
                  <option>Direct &amp; concise</option>
                </Select>
              </Field>
            </div>
            <Button onClick={generate} disabled={!purpose.trim() || loading} className="w-full">
              <Sparkles className="size-4" />
              {loading ? "Generating…" : "Generate email"}
            </Button>
          </div>
        </Card>

        <Card>
          <AiOutput
            title="Email draft"
            value={output}
            onChange={setOutput}
            loading={loading}
            error={error}
            empty={
              <EmptyState
                icon={<Mail className="size-5" />}
                title="No email yet"
                body="Describe what you need to say, pick an audience and tone, then hit Generate email."
              />
            }
          />
        </Card>
      </div>
    </AppLayout>
  );
}
