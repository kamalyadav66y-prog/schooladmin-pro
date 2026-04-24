import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeePayments } from "@/hooks/useFeePayments";
import { useStudents } from "@/hooks/useStudents";
import { useTeachers } from "@/hooks/useTeachers";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  BookOpen,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Plus,
  Users,
} from "lucide-react";
import { useMemo } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  ocid,
  loading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  ocid: string;
  loading: boolean;
}) {
  return (
    <div data-ocid={ocid} className="stat-card card-subtle flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </>
      ) : (
        <>
          <p className="text-2xl font-display font-bold text-foreground leading-none">
            {value}
          </p>
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            {sub && (
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/30">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="font-display font-semibold text-sm text-foreground">
          {title}
        </h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: teachers, isLoading: teachersLoading } = useTeachers();
  const { data: payments, isLoading: paymentsLoading } = useFeePayments();

  // Derived stats
  const totalStudents = students?.length ?? 0;

  const uniqueClasses = useMemo(
    () => new Set(students?.map((s) => s.className) ?? []),
    [students],
  );
  const totalClasses = uniqueClasses.size;

  const totalTeachers = teachers?.length ?? 0;

  const pendingFeesTotal = useMemo(() => {
    if (!payments) return 0;
    return payments
      .filter((p) => p.status === "pending" || p.status === "overdue")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  // Class-wise counts
  const classBreakdown = useMemo(() => {
    if (!students) return [];
    const map = new Map<string, number>();
    for (const s of students) {
      map.set(s.className, (map.get(s.className) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true }),
      );
  }, [students]);

  // Recent payments — last 10 sorted by date desc
  const recentPayments = useMemo(() => {
    if (!payments) return [];
    return [...payments]
      .filter((p) => p.paymentDate)
      .sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
      )
      .slice(0, 10);
  }, [payments]);

  const isLoading = studentsLoading || teachersLoading || paymentsLoading;

  return (
    <div data-ocid="dashboard.page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              School at a glance —{" "}
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/students" data-ocid="dashboard.add_student_button">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Add Student
            </Button>
          </Link>
          <Link to="/fee-payments" data-ocid="dashboard.record_payment_button">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <CreditCard className="w-3.5 h-3.5" />
              Record Payment
            </Button>
          </Link>
          <Link to="/attendance" data-ocid="dashboard.mark_attendance_button">
            <Button size="sm" className="gap-1.5 text-xs">
              <CalendarCheck className="w-3.5 h-3.5" />
              Mark Attendance
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          ocid="dashboard.stat.total_students"
          label="Total Students"
          value={totalStudents}
          sub={`${totalClasses} active class${totalClasses !== 1 ? "es" : ""}`}
          icon={Users}
          color="text-primary"
          loading={studentsLoading}
        />
        <StatCard
          ocid="dashboard.stat.total_classes"
          label="Classes"
          value={totalClasses}
          sub="Active this year"
          icon={GraduationCap}
          color="text-accent"
          loading={studentsLoading}
        />
        <StatCard
          ocid="dashboard.stat.total_teachers"
          label="Teachers"
          value={totalTeachers}
          sub="On faculty"
          icon={BookOpen}
          color="text-warning"
          loading={teachersLoading}
        />
        <StatCard
          ocid="dashboard.stat.pending_fees"
          label="Pending Fees"
          value={isLoading ? "—" : formatCurrency(pendingFeesTotal)}
          sub="Due / overdue balance"
          icon={AlertCircle}
          color="text-destructive"
          loading={paymentsLoading}
        />
      </div>

      {/* Content rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Class-wise breakdown */}
        <SectionCard title="Class-wise Students" icon={GraduationCap}>
          {studentsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : classBreakdown.length === 0 ? (
            <div
              data-ocid="dashboard.classes.empty_state"
              className="flex flex-col items-center py-8 text-center gap-2"
            >
              <GraduationCap className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No students enrolled yet.
              </p>
              <Link to="/students">
                <Button size="sm" variant="outline">
                  Add Students
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5" data-ocid="dashboard.classes.list">
              {classBreakdown.map((cls, i) => {
                const pct =
                  totalStudents > 0 ? (cls.count / totalStudents) * 100 : 0;
                return (
                  <div
                    key={cls.name}
                    data-ocid={`dashboard.class.item.${i + 1}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-smooth"
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground truncate">
                          {cls.name}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground ml-2 shrink-0">
                          {cls.count} student{cls.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Recent payments */}
        <SectionCard title="Recent Fee Payments" icon={CreditCard}>
          {paymentsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <div
              data-ocid="dashboard.payments.empty_state"
              className="flex flex-col items-center py-8 text-center gap-2"
            >
              <CreditCard className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No payments recorded yet.
              </p>
              <Link to="/fee-payments">
                <Button size="sm" variant="outline">
                  Record Payment
                </Button>
              </Link>
            </div>
          ) : (
            <div
              className="divide-y divide-border"
              data-ocid="dashboard.payments.list"
            >
              {recentPayments.map((payment, i) => (
                <div
                  key={payment.id}
                  data-ocid={`dashboard.payment.item.${i + 1}`}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-muted-foreground">
                        {payment.studentName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {payment.studentName || `Student #${payment.studentId}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.className || "—"} ·{" "}
                        {formatDate(payment.paymentDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {formatCurrency(payment.amount)}
                    </p>
                    <span
                      className={
                        payment.status === "paid"
                          ? "fee-status-paid text-xs"
                          : payment.status === "partial"
                            ? "text-xs text-warning font-medium"
                            : "fee-status-overdue text-xs"
                      }
                    >
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-3">
                <Link
                  to="/fee-payments"
                  data-ocid="dashboard.view_all_payments_link"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs h-8"
                  >
                    View all payments →
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
