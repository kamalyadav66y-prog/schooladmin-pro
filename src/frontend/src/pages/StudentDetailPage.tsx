import { StatusBadge } from "@/components/Badge";
import { getPaymentVariant } from "@/components/Badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeePaymentsByStudent } from "@/hooks/useFeePayments";
import { useDeleteStudent, useStudent, useStudents } from "@/hooks/useStudents";
import type { Student } from "@/types";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  GraduationCap,
  Hash,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function DetailField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="mt-0.5 w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm text-foreground mt-0.5 break-words">
          {value || (
            <span className="text-muted-foreground italic">Not provided</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default function StudentDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { data: student, isLoading } = useStudent(id);
  const { data: allStudents = [] } = useStudents();
  const { data: payments = [], isLoading: paymentsLoading } =
    useFeePaymentsByStudent(id);
  const deleteStudent = useDeleteStudent();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const siblings: Student[] = student?.siblingGroup
    ? allStudents.filter(
        (s) => s.siblingGroup === student.siblingGroup && s.id !== student.id,
      )
    : [];

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidPayments = payments.filter((p) => p.status === "paid").length;
  const pendingPayments = payments.filter(
    (p) => p.status === "pending" || p.status === "overdue",
  ).length;

  async function handleDelete() {
    try {
      await deleteStudent.mutateAsync(id);
      toast.success("Student deleted");
      navigate({ to: "/students" });
    } catch {
      toast.error("Failed to delete student");
    }
  }

  if (isLoading) {
    return (
      <div data-ocid="student_detail.loading_state" className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div
        data-ocid="student_detail.error_state"
        className="flex flex-col items-center justify-center py-24 gap-4"
      >
        <Users className="w-12 h-12 text-muted-foreground/40" />
        <p className="text-lg font-display font-semibold">Student not found</p>
        <Link to="/students">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Students
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div data-ocid="student_detail.page" className="space-y-6 max-w-4xl">
      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Link to="/students">
          <Button
            data-ocid="student_detail.back_button"
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Button>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {student.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge variant="info">{student.className}</StatusBadge>
                {student.grade && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Hash className="w-3 h-3" /> Roll {student.grade}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              data-ocid="student_detail.edit_button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() =>
                navigate({ to: "/students/$id/edit", params: { id } })
              }
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
            <Button
              data-ocid="student_detail.delete_button"
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DetailField
                icon={Calendar}
                label="Date of Birth"
                value={
                  student.dob
                    ? new Date(student.dob).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : undefined
                }
              />
              <DetailField
                icon={GraduationCap}
                label="Class"
                value={student.className}
              />
              <DetailField
                icon={MapPin}
                label="Address"
                value={student.address}
              />
              <DetailField
                icon={Hash}
                label="Roll Number"
                value={student.grade}
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              Parent / Guardian Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DetailField
                icon={Users}
                label="Parent Name"
                value={student.parentName}
              />
              <DetailField
                icon={Phone}
                label="Contact Number"
                value={student.parentContact}
              />
              <DetailField
                icon={Mail}
                label="Parent Email"
                value={student.parentEmail}
              />
            </div>
          </div>
        </div>

        {/* Sidebar: Fee Summary + Siblings */}
        <div className="space-y-6">
          {/* Fee Summary */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Fee Summary
            </h2>
            {paymentsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Paid
                  </span>
                  <span className="font-semibold text-foreground">
                    ₹{totalPaid.toLocaleString("en-IN")}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Paid Months
                  </span>
                  <StatusBadge variant="paid">{paidPayments}</StatusBadge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Pending / Overdue
                  </span>
                  <StatusBadge
                    variant={pendingPayments > 0 ? "overdue" : "default"}
                  >
                    {pendingPayments}
                  </StatusBadge>
                </div>
                {payments.length > 0 && (
                  <>
                    <Separator />
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-2 mb-1">
                      Recent Payments
                    </p>
                    <div className="space-y-2">
                      {payments.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="text-xs text-muted-foreground truncate">
                            {p.paymentDate || "—"}
                          </span>
                          <StatusBadge variant={getPaymentVariant(p.status)}>
                            {p.status}
                          </StatusBadge>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {payments.length === 0 && (
                  <p className="text-xs text-muted-foreground italic text-center pt-2">
                    No payment records found
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Siblings */}
          {student.siblingGroup && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> Siblings
              </h2>
              {siblings.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No other siblings found in group {student.siblingGroup}
                </p>
              ) : (
                <div className="space-y-2">
                  {siblings.map((sib) => (
                    <Link
                      key={sib.id}
                      to="/students/$id"
                      params={{ id: sib.id }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-smooth group"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {sib.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sib.className}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Student"
        description={`Are you sure you want to delete ${student.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        isConfirming={deleteStudent.isPending}
      />
    </div>
  );
}
