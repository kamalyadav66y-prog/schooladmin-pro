import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarCheck,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Receipt,
  School,
  Users,
} from "lucide-react";

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard_link",
  },
  {
    to: "/students",
    label: "Students",
    icon: Users,
    ocid: "nav.students_link",
  },
  {
    to: "/fee-structures",
    label: "Fee Structures",
    icon: BookOpen,
    ocid: "nav.fee_structures_link",
  },
  {
    to: "/fee-payments",
    label: "Fee Payments",
    icon: CreditCard,
    ocid: "nav.fee_payments_link",
  },
  {
    to: "/teachers",
    label: "Teachers",
    icon: Receipt,
    ocid: "nav.teachers_link",
  },
  {
    to: "/attendance",
    label: "Attendance",
    icon: CalendarCheck,
    ocid: "nav.attendance_link",
  },
];

export function Sidebar() {
  const { logout, principalId } = useAuth();
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  return (
    <aside className="no-print flex flex-col w-60 min-h-screen bg-card border-r border-border">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
          <School className="w-5 h-5" />
        </div>
        <div className="leading-tight">
          <p className="font-display font-semibold text-sm text-foreground">
            Oakwood Academy
          </p>
          <p className="text-[11px] text-muted-foreground">Admin Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 pb-2">
          Main Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            item.to === "/"
              ? currentPath === "/"
              : currentPath.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              data-ocid={item.ocid}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth group",
                isActive
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        {principalId && (
          <div className="px-3 py-2 rounded-lg bg-muted/60">
            <p className="text-[10px] text-muted-foreground font-medium">
              Admin
            </p>
            <p className="text-xs text-foreground font-mono truncate">
              {principalId.slice(0, 12)}…
            </p>
          </div>
        )}
        <Button
          data-ocid="nav.logout_button"
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
