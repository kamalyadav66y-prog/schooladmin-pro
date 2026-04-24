import { StatusBadge, getPaymentVariant } from "@/components/Badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddFeePayment,
  useDeleteFeePayment,
  useFeePayments,
  useUpdateFeePayment,
} from "@/hooks/useFeePayments";
import { useStudents } from "@/hooks/useStudents";
import type {
  FeePayment,
  FeePaymentInput,
  PaymentStatus,
  Student,
} from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { CreditCard, Pencil, Printer, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const FEE_CATEGORIES = [
  { value: "tuition", label: "Tuition" },
  { value: "transport", label: "Transport" },
  { value: "activity", label: "Activity / Sports" },
  { value: "lab", label: "Lab" },
  { value: "library", label: "Library" },
  { value: "other", label: "Other" },
];

interface PaymentForm {
  studentId: string;
  feeCategory: string;
  amount: string;
  paymentDate: string;
  notes: string;
}

const emptyForm: PaymentForm = {
  studentId: "",
  feeCategory: "tuition",
  amount: "",
  paymentDate: new Date().toISOString().split("T")[0],
  notes: "",
};

function formToInput(form: PaymentForm): FeePaymentInput {
  return {
    studentId: form.studentId,
    studentName: "",
    className: "",
    amount: Number(form.amount) || 0,
    paymentDate: form.paymentDate,
    dueDate: "",
    status: "paid" as PaymentStatus,
    paymentMethod: "Cash",
    receiptNumber: `RCP-${Date.now()}`,
    remarks: form.notes,
    isSiblingBundle: false,
    bundledStudentIds: [],
  };
}

// Sibling Bundle Modal Component
function SiblingBundleModal({
  open,
  onClose,
  students,
  payments,
}: {
  open: boolean;
  onClose: () => void;
  students: Student[];
  payments: FeePayment[];
}) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const allInGroup = useMemo(() => {
    if (!selectedStudent || !selectedStudent.parentContact) return [];
    return students.filter(
      (s) => s.parentContact === selectedStudent.parentContact,
    );
  }, [selectedStudent, students]);

  const siblings = useMemo(
    () => allInGroup.filter((s) => s.id !== selectedStudent?.id),
    [allInGroup, selectedStudent],
  );

  // Sum outstanding balances for all students in the group from loaded payments
  const groupTotal = useMemo(() => {
    if (allInGroup.length === 0) return 0;
    const groupIds = new Set(allInGroup.map((s) => s.id));
    return payments
      .filter((p) => groupIds.has(p.studentId))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [allInGroup, payments]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="sibling_bundle.dialog" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Bundle Sibling Fees
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Select a Student</Label>
            <Select
              value={selectedStudent?.id ?? ""}
              onValueChange={(id) =>
                setSelectedStudent(students.find((s) => s.id === id) ?? null)
              }
            >
              <SelectTrigger data-ocid="sibling_bundle.student_select">
                <SelectValue placeholder="Choose student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {s.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">
                Parent: {selectedStudent.parentName} (
                {selectedStudent.parentContact})
              </p>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Students in this group
                </p>
                {allInGroup.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center text-sm py-1 border-b border-border last:border-0"
                  >
                    <span className="text-foreground">{s.name}</span>
                    <span className="text-muted-foreground">{s.className}</span>
                  </div>
                ))}
              </div>
              {siblings.length > 0 ? (
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Combined Group Fee
                  </span>
                  <span className="font-mono font-semibold text-foreground text-base">
                    ₹{groupTotal > 0 ? groupTotal.toLocaleString("en-IN") : "—"}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No siblings found for this student.
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end pt-2">
          <Button
            data-ocid="sibling_bundle.close_button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FeePaymentsPage() {
  const { data: payments = [], isLoading } = useFeePayments();
  const { data: students = [] } = useStudents();
  const addMutation = useAddFeePayment();
  const updateMutation = useUpdateFeePayment();
  const deleteMutation = useDeleteFeePayment();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>(
    "all",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PaymentForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [siblingOpen, setSiblingOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = payments;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.studentName.toLowerCase().includes(q) ||
          p.className.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    return list;
  }, [payments, search, statusFilter]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: FeePayment) {
    setEditingId(p.id);
    setForm({
      studentId: p.studentId,
      feeCategory: "tuition",
      amount: p.amount.toString(),
      paymentDate: p.paymentDate || new Date().toISOString().split("T")[0],
      notes: p.remarks,
    });
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit() {
    if (!form.studentId || !form.amount) {
      toast.error("Student and amount are required.");
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          input: formToInput(form),
        });
        toast.success("Payment updated.");
      } else {
        await addMutation.mutateAsync(formToInput(form));
        toast.success("Payment recorded.");
      }
      handleClose();
    } catch {
      toast.error("Failed to save payment.");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Payment deleted.");
    } catch {
      toast.error("Failed to delete payment.");
    } finally {
      setDeleteId(null);
    }
  }

  const columns: Column<FeePayment>[] = [
    {
      key: "student",
      header: "Student",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground text-sm">
            {row.studentName || "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.className || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "receipt",
      header: "Receipt #",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.receiptNumber || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount (₹)",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <span className="font-mono font-medium text-foreground">
          ₹{row.amount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "date",
      header: "Payment Date",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.paymentDate
            ? new Date(row.paymentDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge variant={getPaymentVariant(row.status)}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </StatusBadge>
      ),
    },
    {
      key: "bundle",
      header: "",
      cell: (row) =>
        row.isSiblingBundle ? (
          <StatusBadge variant="info" className="gap-1">
            <Users className="w-3 h-3" />
            Bundle
          </StatusBadge>
        ) : null,
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-32",
      className: "w-32",
      cell: (row, index) => (
        <div className="flex items-center gap-1">
          <Button
            data-ocid={`fee_payments.print_button.${index + 1}`}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              navigate({ to: `/fee-payments/${row.id}/receipt` });
            }}
            aria-label="Print receipt"
          >
            <Printer className="w-4 h-4" />
          </Button>
          <Button
            data-ocid={`fee_payments.edit_button.${index + 1}`}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
            aria-label="Edit payment"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            data-ocid={`fee_payments.delete_button.${index + 1}`}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(row.id);
            }}
            aria-label="Delete payment"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const isSubmitting = addMutation.isPending || updateMutation.isPending;

  return (
    <div data-ocid="fee_payments.page" className="space-y-6">
      <PageHeader
        title="Fee Payments"
        description="Record and track student fee payments"
        action={{ label: "Record Payment", onClick: openAdd }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
        </div>
      </PageHeader>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by student name..."
          className="w-full sm:w-72"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as "all" | PaymentStatus)}
        >
          <SelectTrigger
            data-ocid="fee_payments.status_filter"
            className="w-full sm:w-44"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Button
          data-ocid="fee_payments.sibling_bundle_button"
          variant="outline"
          className="gap-2 sm:ml-auto"
          onClick={() => setSiblingOpen(true)}
        >
          <Users className="w-4 h-4" />
          Bundle Sibling Fees
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
          emptyState={
            <div
              data-ocid="fee_payments.empty_state"
              className="flex flex-col items-center gap-2 py-4"
            >
              <CreditCard className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "No payments match your filters"
                  : "No payments recorded yet"}
              </p>
              {!search && statusFilter === "all" && (
                <p className="text-xs text-muted-foreground">
                  Click "Record Payment" to add the first entry.
                </p>
              )}
            </div>
          }
        />
      </div>

      {/* Add / Edit Modal */}
      <FormModal
        open={modalOpen}
        onClose={handleClose}
        title={editingId ? "Edit Payment" : "Record Payment"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={editingId ? "Update" : "Record"}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>
              Student <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.studentId}
              onValueChange={(v) => setForm((f) => ({ ...f, studentId: v }))}
            >
              <SelectTrigger data-ocid="fee_payments.student_select">
                <SelectValue placeholder="Select student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {s.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Fee Category</Label>
            <Select
              value={form.feeCategory}
              onValueChange={(v) => setForm((f) => ({ ...f, feeCategory: v }))}
            >
              <SelectTrigger data-ocid="fee_payments.category_select">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {FEE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-amount">
              Amount (₹) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pay-amount"
              data-ocid="fee_payments.amount_input"
              type="number"
              min={0}
              placeholder="e.g. 15000"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-date">Payment Date</Label>
            <Input
              id="pay-date"
              data-ocid="fee_payments.date_input"
              type="date"
              value={form.paymentDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, paymentDate: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-notes">Notes</Label>
            <Input
              id="pay-notes"
              data-ocid="fee_payments.notes_input"
              placeholder="Optional remarks"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
        </div>
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Payment"
        description="This will permanently remove this payment record. This cannot be undone."
        confirmLabel="Delete"
        isDestructive
        isConfirming={deleteMutation.isPending}
      />

      {/* Sibling Bundle Modal */}
      <SiblingBundleModal
        open={siblingOpen}
        onClose={() => setSiblingOpen(false)}
        students={students}
        payments={payments}
      />
    </div>
  );
}
