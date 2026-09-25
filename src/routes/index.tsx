import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  CalendarClock,
  BookOpenText,
  MessagesSquare,
  CheckCircle2,
  Circle,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

import { AppLayout } from "@/components/app-layout";
import { Card, Disclaimer } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AXON Dashboard — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "AXON is an AI workplace assistant for writing emails, planning your day, researching topics and answering work questions.",
      },
      { property: "og:title", content: "AXON Dashboard — AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Write emails, plan your day, research topics and chat with an AI workplace assistant.",
      },
    ],
  }),
  component: Dashboard,
});

const QUICK_ACTIONS = [
  {
    to: "/email",
    label: "Smart Email Generator",
    body: "Draft a polished email for a client, manager or your team.",
    icon: Mail,
  },
  {
    to: "/planner",
    label: "AI Task Planner",
    body: "Turn your task list into a realistic, prioritised schedule.",
    icon: CalendarClock,
  },
  {
    to: "/research",
    label: "AI Research Assistant",
    body: "Summarise a topic, link or article into clear insights.",
    icon: BookOpenText,
  },
  {
    to: "/chat",
    label: "AI Workplace Chat",
    body: "Ask anything about work, processes or difficult conversations.",
    icon: MessagesSquare,
  },
] as const;

const INITIAL_TASKS = [
  { id: 1, title: "Review Q3 campaign brief", time: "09:00", priority: "High", done: true },
  { id: 2, title: "Client follow-up email", time: "11:00", priority: "High", done: false },
  { id: 3, title: "Team stand-up", time: "13:30", priority: "Medium", done: false },
  { id: 4, title: "Draft onboarding checklist", time: "15:00", priority: "Low", done: false },
];

function Dashboard() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const done = tasks.filter((t) => t.done).length;
  const progress = Math.round((done / tasks.length) * 100);

  return (
    <AppLayout title="Good day 👋" description="Here's your workspace at a glance.">
      <div className="space-y-6">
        <Card className="bg-primary text-primary-foreground">
          <p className="text-sm/relaxed opacity-90">Welcome back to</p>
          <h2 className="font-display text-3xl font-bold">AXON</h2>
          <p className="mt-2 max-w-xl text-sm opacity-90">
            Your AI workplace assistant. Write better emails, plan a realistic day, digest research
            fast and get answers to workplace questions — all in one place.
          </p>
        </Card>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Quick actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {QUICK_ACTIONS.map(({ to, label, body, icon: Icon }) => (
              <Link key={to} to={to} className="card-surface group p-5 transition hover:shadow-[var(--shadow-float)]">
                <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon className="size-5" />
                </span>
                <p className="font-semibold">{label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Open <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Today's tasks</h2>
              <Link to="/planner" className="text-sm font-semibold text-primary">
                Plan my day
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {tasks.map((task) => (
                <li key={task.id}>
                  <button
                    onClick={() =>
                      setTasks((prev) =>
                        prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)),
                      )
                    }
                    className="flex w-full items-center gap-3 py-3 text-left"
                  >
                    {task.done ? (
                      <CheckCircle2 className="size-5 shrink-0 text-primary" />
                    ) : (
                      <Circle className="size-5 shrink-0 text-muted-foreground" />
                    )}
                    <span className={task.done ? "flex-1 text-muted-foreground line-through" : "flex-1"}>
                      {task.title}
                    </span>
                    <span className="hidden text-xs text-muted-foreground sm:block">{task.time}</span>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                      {task.priority}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold">Productivity</h2>
            <p className="font-display text-4xl font-bold">{progress}%</p>
            <p className="text-sm text-muted-foreground">of today's tasks completed</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <dt className="flex-1 text-muted-foreground">Focus time planned</dt>
                <dd className="font-semibold">4h 30m</dd>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                <dt className="flex-1 text-muted-foreground">Tasks remaining</dt>
                <dd className="font-semibold">{tasks.length - done}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <Disclaimer />
      </div>
    </AppLayout>
  );
}
