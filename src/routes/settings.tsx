import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

import { AppLayout } from "@/components/app-layout";
import { Card, Field, Select, TextInput, SectionTitle, Disclaimer } from "@/components/ui-kit";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AXON AI Workplace Assistant" },
      {
        name: "description",
        content: "Set your display name, default writing tone and working hours for AXON's AI tools.",
      },
      { property: "og:title", content: "Settings — AXON" },
      { property: "og:description", content: "Personalise AXON's defaults for tone, role and working hours." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState("Formal");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  return (
    <AppLayout title="Settings" description="Preferences for this session.">
      <div className="grid max-w-3xl gap-6">
        <Card>
          <SectionTitle
            title="Your profile"
            hint="Used only in this browser session — AXON stores nothing and has no accounts."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" />
            </Field>
            <Field label="Role">
              <TextInput value={role} onChange={(e) => setRole(e.target.value)} placeholder="Project Manager" />
            </Field>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Defaults" hint="Starting points for the email and planner tools." />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Default tone">
              <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                <option>Formal</option>
                <option>Friendly</option>
                <option>Persuasive</option>
                <option>Assertive</option>
              </Select>
            </Field>
            <Field label="Work starts">
              <TextInput type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </Field>
            <Field label="Work ends">
              <TextInput type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card>
          <div className="flex gap-3">
            <ShieldCheck className="size-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">Responsible AI</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                AXON does not store your inputs, and there are no accounts or databases. Everything you type
                stays in this browser session.
              </p>
              <Disclaimer className="mt-3" />
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
