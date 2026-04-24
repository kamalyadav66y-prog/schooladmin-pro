import { StatusBadge } from "@/components/Badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
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
  useAddStudent,
  useDeleteStudent,
  useStudents,
} from "@/hooks/useStudents";
import type { Student, StudentInput } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { Eye, Pencil, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const CLASS_OPTIONS = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
];

const EMPTY_FORM: StudentInput = {
  name: "",
  dob: "",
  address: "",
  className: "",
  grade: "",
  parentName: "",
  parentContact: "",
  parentEmail: "",
  siblingGroup: "",
  travelFee: 0,
  enrollmentDate: "",
};

export default function StudentsPage() {
  const navigate = useNavigate();
  const { data: students = [], isLoading } = useStudents();
  const addStudent = useAddStudent();
  const deleteStudent = useDeleteStudent();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<StudentInput>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof StudentInput, string>>
  >({});
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim();
    return students.filter((s) => {
      const matchesClass = classFilter === "all" || s.className === classFilter;
      if (!matchesClass) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q) ||
        s.parentContact.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q) ||
        s.grade?.toLowerCase().includes(q)
      );
    });
  }, [students, search, classFilter]);

  function setField<K extends keyof StudentInput>(
    key: K,
    value: StudentInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key])
      setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateForm(): boolean {
    const errors: Partial<Record<keyof StudentInput, string>> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.className) errors.className = "Class is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleAddSubmit() {
    if (!validateForm()) return;
    try {
      await addStudent.mutateAsync(form);
      toast.success("Student added successfully");
      setAddOpen(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
    } catch {
      toast.error("Failed to add student");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteStudent.mutateAsync(deleteTarget.id);
      toast.success("Student deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete student");
    }
  }

  const columns: Column<Student>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <span className="font-medium text-foreground">{row.name}</span>
      ),
    },
    {
      key: "className",
      header: "Class",
      cell: (row) => <StatusBadge variant="info">{row.className}</StatusBadge>,
    },
    {
      key: "parentContact",
      header: "Parent Contact",
      cell: (row) => (
        <span className="text-sm text-muted-foreground font-mono">
          {row.parentContact || "—"}
        </span>
      ),
    },
    {
      key: "parentName",
      header: "Parent Name",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.parentName || "—"}
        </span>
      ),
    },
    {
      key: "dob",
      header: "Date of Birth",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.dob ? new Date(row.dob).toLocaleDateString("en-IN") : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row, index) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            data-ocid={`students.view_button.${index + 1}`}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              navigate({ to: "/students/$id", params: { id: row.id } });
            }}
            aria-label="View student"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            data-ocid={`students.edit_button.${index + 1}`}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              navigate({ to: "/students/$id/edit", params: { id: row.id } });
            }}
            aria-label="Edit student"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            data-ocid={`students.delete_button.${index + 1}`}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            aria-label="Delete student"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div data-ocid="students.page" className="space-y-6">
      <PageHeader
        title="Students"
        description={`${students.length} student${students.length !== 1 ? "s" : ""} enrolled`}
        action={{ label: "Add Student", onClick: () => setAddOpen(true) }}
      >
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-primary" />
          </div>
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, class, or parent contact..."
          className="flex-1"
        />
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger
            data-ocid="students.class_filter.select"
            className="w-full sm:w-44"
          >
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASS_OPTIONS.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        emptyState={
          <div
            data-ocid="students.empty_state"
            className="flex flex-col items-center gap-2 py-4"
          >
            <Users className="w-10 h-10 text-muted-foreground/40" />
            <p className="font-medium text-foreground">No students found</p>
            <p className="text-sm text-muted-foreground">
              {search || classFilter !== "all"
                ? "Try adjusting your search or filter"
                : "Add your first student to get started"}
            </p>
          </div>
        }
      />

      {/* Add Student Modal */}
      <FormModal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setForm(EMPTY_FORM);
          setFormErrors({});
        }}
        title="Add Student"
        onSubmit={handleAddSubmit}
        isSubmitting={addStudent.isPending}
        submitLabel="Add Student"
        size="lg"
      >
        <div className="space-y-4 px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="add_student.name.input"
                id="add-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Arjun Sharma"
              />
              {formErrors.name && (
                <p
                  data-ocid="add_student.name.field_error"
                  className="text-xs text-destructive"
                >
                  {formErrors.name}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-dob">Date of Birth</Label>
              <Input
                data-ocid="add_student.dob.input"
                id="add-dob"
                type="date"
                value={form.dob}
                onChange={(e) => setField("dob", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-class">
                Class <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.className}
                onValueChange={(v) => setField("className", v)}
              >
                <SelectTrigger
                  data-ocid="add_student.class.select"
                  id="add-class"
                >
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.className && (
                <p
                  data-ocid="add_student.class.field_error"
                  className="text-xs text-destructive"
                >
                  {formErrors.className}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-roll">Roll Number</Label>
              <Input
                data-ocid="add_student.roll.input"
                id="add-roll"
                value={form.grade}
                onChange={(e) => setField("grade", e.target.value)}
                placeholder="e.g. 12"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-address">Address</Label>
            <Input
              data-ocid="add_student.address.input"
              id="add-address"
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="e.g. 123 Park Street, Mumbai"
            />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Parent / Guardian Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="add-p1name">Parent 1 Name</Label>
                <Input
                  data-ocid="add_student.parent1_name.input"
                  id="add-p1name"
                  value={form.parentName}
                  onChange={(e) => setField("parentName", e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-p1contact">Parent 1 Contact</Label>
                <Input
                  data-ocid="add_student.parent1_contact.input"
                  id="add-p1contact"
                  value={form.parentContact}
                  onChange={(e) => setField("parentContact", e.target.value)}
                  placeholder="+91-98765-43210"
                />
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="add-email">Parent Email</Label>
              <Input
                data-ocid="add_student.parent_email.input"
                id="add-email"
                type="email"
                value={form.parentEmail}
                onChange={(e) => setField("parentEmail", e.target.value)}
                placeholder="e.g. parent@email.com"
              />
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Student"
        description={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        isConfirming={deleteStudent.isPending}
      />
    </div>
  );
}
