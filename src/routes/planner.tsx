import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Sparkles } from "lucide-react";
import { useState } from "react";

import { AiOutput } from "@/components/ai-output";
import { AppLayout } from "@/components/app-layout";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Select,
  TextArea,
  TextInput,
  SectionTitle,
} from "@/components/ui-kit";
import { useAiGenerator } from "@/lib/use-ai";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AXON" },
      {
        name: "description",
        content: "Turn your tasks, priorities and deadlines into a realistic daily or weekly schedule with breaks.",
      },
      { property: "og:title", content: "AI Task Planner — AXON" },
      {
        property: "og:description",
        content: "Realistic time blocks, prioritisation and overload warnings for your day or week.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const [tasks, setTasks] = useState("");
  const [range, setRange] = useState("Daily");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [deadlines, setDeadlines] = useState("");
  const { output, setOutput, loading, error, run } = useAiGenerator("planner");

  const generate = () => {
    if (!tasks.trim() || loading) return;
    run(
      `Build a ${range.toLowerCase()} schedule.\nWorking hours: ${start} to ${end}\nTasks with priorities:\n"""${tasks.trim()}"""\nDeadlines and fixed commitments: ${deadlines.trim() || "none stated"}`,
    );
  };

  return (
    <AppLayout title="AI Task Planner" description="A realistic plan for your day or week.">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card>
          <SectionTitle title="Your workload" hint="List one task per line with its priority." />
          <div className="space-y-4">
            <Field
              label="Tasks & priorities"
              hint="e.g. Finish client proposal — high&#10;Inbox triage — low"
            >
              <TextArea
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                placeholder={"Finish client proposal — high\nPrepare board slides — high\nInbox triage — low"}
                className="min-h-40"
              />
            </Field>
            <Field label="Plan for">
              <Select value={range} onChange={(e) => setRange(e.target.value)}>
                <option>Daily</option>
                <option>Weekly</option>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start">
                <TextInput type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </Field>
              <Field label="End">
                <TextInput type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
              </Field>
            </div>
            <Field label="Deadlines & fixed meetings" hint="Optional, but improves accuracy.">
              <TextArea
                value={deadlines}
                onChange={(e) => setDeadlines(e.target.value)}
                placeholder="Proposal due 16:00, stand-up 09:30–09:45"
                className="min-h-20"
              />
            </Field>
            <Button onClick={generate} disabled={!tasks.trim() || loading} className="w-full">
              <Sparkles className="size-4" />
              {loading ? "Planning…" : "Generate plan"}
            </Button>
          </div>
        </Card>

        <Card>
          <AiOutput
            title="Your schedule"
            value={output}
            onChange={setOutput}
            loading={loading}
            error={error}
            empty={
              <EmptyState
                icon={<CalendarClock className="size-5" />}
                title="No plan yet"
                body="Add your tasks and working hours, then generate a time-blocked schedule with breaks and overload warnings."
              />
            }
          />
        </Card>
      </div>
    </AppLayout>
  );
}
