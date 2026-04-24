import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-foreground/30 backdrop-blur-sm lg:hidden no-print"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex no-print">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex lg:hidden no-print transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 -right-12 bg-card text-foreground shadow"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="no-print sticky top-0 z-10 flex items-center justify-between h-14 px-4 bg-card border-b border-border shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <span className="font-display font-semibold text-foreground hidden sm:block">
              Oakwood Academy
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>

        {/* Footer */}
        <footer className="no-print border-t border-border bg-muted/40 px-6 py-3">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
