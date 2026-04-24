import { StatusBadge } from "@/components/Badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAddTeacher,
  useDeleteTeacher,
  useTeachers,
  useUpdateTeacher,
} from "@/hooks/useTeachers";
import type { Teacher, TeacherInput } from "@/types";
import { Edit2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const CLASSES = [
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

const emptyForm = (): TeacherInput => ({
  name: "",
  subject: "",
  className: "",
});

export default function TeachersPage() {
  const { data: teachers = [], isLoading } = useTeachers();
  const addTeacher = useAddTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);
  const [form, setForm] = useState<TeacherInput>(emptyForm());
  const [errors, setErrors] = useState<
    Partial<Record<keyof TeacherInput, string>>
  >({});

  const filtered = useMemo(() => {
    if (!search.trim()) return teachers;
    const q = search.toLowerCase();
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.className.toLowerCase().includes(q),
    );
  }, [teachers, search]);

  function openAdd() {
    setEditingTeacher(null);
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(teacher: Teacher) {
    setEditingTeacher(teacher);
    setForm({
      name: teacher.name,
      subject: teacher.subject,
      className: teacher.className,
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof TeacherInput, string>> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.className.trim()) errs.className = "Assigned class is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    if (editingTeacher) {
      await updateTeacher.mutateAsync(
        { id: editingTeacher.id, input: form },
        {
          onSuccess: () => {
            toast.success("Teacher updated successfully");
            setModalOpen(false);
          },
          onError: () => toast.error("Failed to update teacher"),
        },
      );
    } else {
      await addTeacher.mutateAsync(form, {
        onSuccess: () => {
          toast.success("Teacher added successfully");
          setModalOpen(false);
        },
        onError: () => toast.error("Failed to add teacher"),
      });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteTeacher.mutateAsync(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Teacher removed successfully");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to remove teacher"),
    });
  }

  const columns = [
    {
      key: "name",
      header: "Teacher",
      cell: (t: Teacher) => (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground truncate">{t.name}</span>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      cell: (t: Teacher) => (
        <StatusBadge variant="info">{t.subject || "—"}</StatusBadge>
      ),
    },
    {
      key: "className",
      header: "Assigned Class",
      cell: (t: Teacher) => (
        <span className="text-sm font-medium text-primary">
          {t.className || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-20",
      cell: (t: Teacher, idx: number) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            data-ocid={`teachers.edit_button.${idx + 1}`}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(t);
            }}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            data-ocid={`teachers.delete_button.${idx + 1}`}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(t);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const isSubmitting = addTeacher.isPending || updateTeacher.isPending;

  return (
    <div data-ocid="teachers.page" className="space-y-6">
      <PageHeader
        title="Teachers"
        description={`${teachers.length} teacher${teachers.length !== 1 ? "s" : ""} registered`}
        action={{ label: "Add Teacher", onClick: openAdd }}
      >
        <Input
          data-ocid="teachers.search_input"
          placeholder="Search by name, subject, class…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </PageHeader>

      <div className="bg-card rounded-lg border border-border shadow-sm">
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          keyExtractor={(t) => t.id}
          emptyState={
            <div
              data-ocid="teachers.empty_state"
              className="flex flex-col items-center gap-2 py-8"
            >
              <span className="text-4xl">👩‍🏫</span>
              <p className="text-sm font-medium text-foreground">
                No teachers found
              </p>
              <p className="text-xs text-muted-foreground">
                {search
                  ? "Try a different search term"
                  : "Add your first teacher to get started"}
              </p>
            </div>
          }
        />
      </div>

      {/* Add / Edit Modal */}
      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTeacher ? "Edit Teacher" : "Add Teacher"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={editingTeacher ? "Save Changes" : "Add Teacher"}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="teacher-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="teacher-name"
              data-ocid="teachers.name_input"
              placeholder="e.g. Mrs. Sunita Verma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && (
              <p
                data-ocid="teachers.name.field_error"
                className="text-xs text-destructive"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="teacher-subject">Subject</Label>
              <Input
                id="teacher-subject"
                data-ocid="teachers.subject_input"
                placeholder="e.g. Mathematics"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="teacher-class">
                Assigned Class <span className="text-destructive">*</span>
              </Label>
              <select
                id="teacher-class"
                data-ocid="teachers.class_select"
                value={form.className}
                onChange={(e) =>
                  setForm({ ...form, className: e.target.value })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select class…</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.className && (
                <p
                  data-ocid="teachers.class.field_error"
                  className="text-xs text-destructive"
                >
                  {errors.className}
                </p>
              )}
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Remove ${deleteTarget?.name ?? "teacher"}?`}
        description="This will permanently delete the teacher record and all associated attendance data. This action cannot be undone."
        confirmLabel="Remove Teacher"
        isDestructive
        isConfirming={deleteTeacher.isPending}
      />
    </div>
  );
}
