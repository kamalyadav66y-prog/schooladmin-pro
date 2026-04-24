import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
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
  useAddFeeStructure,
  useDeleteFeeStructure,
  useFeeStructures,
  useUpdateFeeStructure,
} from "@/hooks/useFeeStructures";
import type { FeeStructure, FeeStructureInput } from "@/types";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const FEE_CATEGORIES = [
  { value: "tuition", label: "Tuition" },
  { value: "transport", label: "Transport" },
  { value: "activity", label: "Activity / Sports" },
  { value: "lab", label: "Lab" },
  { value: "library", label: "Library" },
  { value: "other", label: "Other" },
] as const;

type FeeCategory = (typeof FEE_CATEGORIES)[number]["value"];

interface FeeStructureForm {
  className: string;
  feeCategory: FeeCategory;
  amount: string;
  term: string;
  description: string;
}

const emptyForm: FeeStructureForm = {
  className: "",
  feeCategory: "tuition",
  amount: "",
  term: "",
  description: "",
};

function formToInput(form: FeeStructureForm): FeeStructureInput {
  const amt = Number(form.amount) || 0;
  return {
    className: form.className,
    grade: form.className,
    academicYear: new Date().getFullYear().toString(),
    tuitionFee: form.feeCategory === "tuition" ? amt : 0,
    travelFee: form.feeCategory === "transport" ? amt : 0,
    labFee: form.feeCategory === "lab" ? amt : 0,
    libraryFee: form.feeCategory === "library" ? amt : 0,
    sportsFee: form.feeCategory === "activity" ? amt : 0,
    otherFee: form.feeCategory === "other" ? amt : 0,
    totalFee: amt,
  };
}

function getCategoryLabel(fs: FeeStructure): string {
  if (fs.tuitionFee > 0) return "Tuition";
  if (fs.travelFee > 0) return "Transport";
  if (fs.labFee > 0) return "Lab";
  if (fs.libraryFee > 0) return "Library";
  if (fs.sportsFee > 0) return "Activity / Sports";
  if (fs.otherFee > 0) return "Other";
  return "Mixed";
}

function getCategoryAmount(fs: FeeStructure): number {
  return Math.max(
    fs.tuitionFee,
    fs.travelFee,
    fs.labFee,
    fs.libraryFee,
    fs.sportsFee,
    fs.otherFee,
    0,
  );
}

function structureToForm(fs: FeeStructure): FeeStructureForm {
  let feeCategory: FeeCategory = "tuition";
  if (fs.travelFee > 0) feeCategory = "transport";
  else if (fs.labFee > 0) feeCategory = "lab";
  else if (fs.libraryFee > 0) feeCategory = "library";
  else if (fs.sportsFee > 0) feeCategory = "activity";
  else if (fs.otherFee > 0) feeCategory = "other";
  return {
    className: fs.className,
    feeCategory,
    amount: getCategoryAmount(fs).toString(),
    term: fs.academicYear,
    description: "",
  };
}

export default function FeeStructuresPage() {
  const { data: feeStructures = [], isLoading } = useFeeStructures();
  const addMutation = useAddFeeStructure();
  const updateMutation = useUpdateFeeStructure();
  const deleteMutation = useDeleteFeeStructure();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FeeStructureForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(fs: FeeStructure) {
    setEditingId(fs.id);
    setForm(structureToForm(fs));
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit() {
    if (!form.className.trim() || !form.amount) {
      toast.error("Class and amount are required.");
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          input: formToInput(form),
        });
        toast.success("Fee structure updated.");
      } else {
        await addMutation.mutateAsync(formToInput(form));
        toast.success("Fee structure added.");
      }
      handleClose();
    } catch {
      toast.error("Failed to save fee structure.");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Fee structure deleted.");
    } catch {
      toast.error("Failed to delete fee structure.");
    } finally {
      setDeleteId(null);
    }
  }

  const columns: Column<FeeStructure>[] = [
    {
      key: "class",
      header: "Class",
      cell: (row) => (
        <span className="font-medium text-foreground">{row.className}</span>
      ),
    },
    {
      key: "category",
      header: "Fee Category",
      cell: (row) => (
        <span className="text-sm text-foreground">{getCategoryLabel(row)}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount (₹)",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <span className="font-mono font-medium text-foreground">
          ₹{getCategoryAmount(row).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "totalFee",
      header: "Total Fee (₹)",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <span className="font-mono text-sm text-muted-foreground">
          ₹{row.totalFee.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "term",
      header: "Academic Year",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.academicYear}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-20",
      className: "w-20",
      cell: (row, index) => (
        <div className="flex items-center gap-1">
          <Button
            data-ocid={`fee_structures.edit_button.${index + 1}`}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
            aria-label="Edit fee structure"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            data-ocid={`fee_structures.delete_button.${index + 1}`}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(row.id);
            }}
            aria-label="Delete fee structure"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const isSubmitting = addMutation.isPending || updateMutation.isPending;

  return (
    <div data-ocid="fee_structures.page" className="space-y-6">
      <PageHeader
        title="Fee Structures"
        description="Configure per-class fee components and annual rates"
        action={{ label: "Add Fee Structure", onClick: openAdd }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
        </div>
      </PageHeader>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <DataTable
          columns={columns}
          data={feeStructures}
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
          emptyState={
            <div
              data-ocid="fee_structures.empty_state"
              className="flex flex-col items-center gap-2 py-4"
            >
              <BookOpen className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                No fee structures found
              </p>
              <p className="text-xs text-muted-foreground">
                Click "Add Fee Structure" to configure fees for a class.
              </p>
            </div>
          }
        />
      </div>

      {/* Add / Edit Modal */}
      <FormModal
        open={modalOpen}
        onClose={handleClose}
        title={editingId ? "Edit Fee Structure" : "Add Fee Structure"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={editingId ? "Update" : "Add"}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fs-class">
              Class <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fs-class"
              data-ocid="fee_structures.class_input"
              placeholder="e.g. Class 5"
              value={form.className}
              onChange={(e) =>
                setForm((f) => ({ ...f, className: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fs-category">Fee Category</Label>
            <Select
              value={form.feeCategory}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, feeCategory: v as FeeCategory }))
              }
            >
              <SelectTrigger
                id="fs-category"
                data-ocid="fee_structures.category_select"
              >
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
            <Label htmlFor="fs-amount">
              Amount (₹) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fs-amount"
              data-ocid="fee_structures.amount_input"
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
            <Label htmlFor="fs-term">Term / Period</Label>
            <Input
              id="fs-term"
              data-ocid="fee_structures.term_input"
              placeholder="e.g. Annual 2025–26"
              value={form.term}
              onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fs-desc">Description</Label>
            <Input
              id="fs-desc"
              data-ocid="fee_structures.description_input"
              placeholder="Optional notes"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
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
        title="Delete Fee Structure"
        description="This will permanently remove this fee structure. This cannot be undone."
        confirmLabel="Delete"
        isDestructive
        isConfirming={deleteMutation.isPending}
      />
    </div>
  );
}
