import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  CalendarClock,
  BookOpenText,
  MessagesSquare,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Disclaimer } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/planner", label: "Task Planner", icon: CalendarClock },
  { to: "/research", label: "Research Assistant", icon: BookOpenText },
  { to: "/chat", label: "AI Chat", icon: MessagesSquare },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-68 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-display text-base font-bold text-primary-foreground">
              A
            </span>
            <span>
              <span className="block font-display text-lg font-bold leading-none">AXON</span>
              <span className="block text-xs text-muted-foreground">AI Workplace Assistant</span>
            </span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition hover:bg-sidebar-accent data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
            >
              <Icon className="size-4.5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <Disclaimer />
        </div>
      </aside>

      <div className="lg:pl-68">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-4 backdrop-blur sm:px-8">
          <button
            className="rounded-lg border border-border bg-card p-2 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
