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
import { Skeleton } from "@/components/ui/skeleton";
import { useStudent, useUpdateStudent } from "@/hooks/useStudents";
import type { StudentInput } from "@/types";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, GraduationCap, Save, Users } from "lucide-react";
import { useEffect, useState } from "react";
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

function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function StudentEditPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { data: student, isLoading } = useStudent(id);
  const updateStudent = useUpdateStudent();

  const [form, setForm] = useState<StudentInput | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof StudentInput, string>>
  >({});

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name,
        dob: student.dob,
        address: student.address,
        className: student.className,
        grade: student.grade,
        parentName: student.parentName,
        parentContact: student.parentContact,
        parentEmail: student.parentEmail,
        siblingGroup: student.siblingGroup,
        travelFee: student.travelFee,
        enrollmentDate: student.enrollmentDate,
      });
    }
  }, [student]);

  function setField<K extends keyof StudentInput>(
    key: K,
    value: StudentInput[K],
  ) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    if (!form) return false;
    const e: Partial<Record<keyof StudentInput, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.className) e.className = "Class is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!form || !validate()) return;
    try {
      await updateStudent.mutateAsync({ id, input: form });
      toast.success("Student updated successfully");
      navigate({ to: "/students/$id", params: { id } });
    } catch {
      toast.error("Failed to update student");
    }
  }

  if (isLoading || !form) {
    return (
      <div
        data-ocid="student_edit.loading_state"
        className="space-y-6 max-w-3xl"
      >
        <Skeleton className="h-8 w-40" />
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div
        data-ocid="student_edit.error_state"
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
    <div data-ocid="student_edit.page" className="space-y-6 max-w-3xl">
      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Link to="/students/$id" params={{ id }}>
          <Button
            data-ocid="student_edit.back_button"
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">
            Edit Student
          </h1>
          <p className="text-sm text-muted-foreground">{student.name}</p>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Personal Information
        </p>

        <FormRow>
          <Field label="Full Name" required error={errors.name}>
            <Input
              data-ocid="student_edit.name.input"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Arjun Sharma"
            />
          </Field>
          <Field label="Date of Birth">
            <Input
              data-ocid="student_edit.dob.input"
              type="date"
              value={form.dob}
              onChange={(e) => setField("dob", e.target.value)}
            />
          </Field>
        </FormRow>

        <FormRow>
          <Field label="Class" required error={errors.className}>
            <Select
              value={form.className}
              onValueChange={(v) => setField("className", v)}
            >
              <SelectTrigger data-ocid="student_edit.class.select">
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
          </Field>
          <Field label="Roll Number">
            <Input
              data-ocid="student_edit.roll.input"
              value={form.grade}
              onChange={(e) => setField("grade", e.target.value)}
              placeholder="e.g. 12"
            />
          </Field>
        </FormRow>

        <Field label="Address">
          <Input
            data-ocid="student_edit.address.input"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            placeholder="e.g. 123 Park Street, Mumbai"
          />
        </Field>
      </div>

      {/* Parent Details */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Parent / Guardian Details
        </p>

        <FormRow>
          <Field label="Parent Name">
            <Input
              data-ocid="student_edit.parent_name.input"
              value={form.parentName}
              onChange={(e) => setField("parentName", e.target.value)}
              placeholder="e.g. Rajesh Sharma"
            />
          </Field>
          <Field label="Parent Contact">
            <Input
              data-ocid="student_edit.parent_contact.input"
              value={form.parentContact}
              onChange={(e) => setField("parentContact", e.target.value)}
              placeholder="+91-98765-43210"
            />
          </Field>
        </FormRow>

        <Field label="Parent Email">
          <Input
            data-ocid="student_edit.parent_email.input"
            type="email"
            value={form.parentEmail}
            onChange={(e) => setField("parentEmail", e.target.value)}
            placeholder="e.g. parent@email.com"
          />
        </Field>
      </div>

      {/* Sibling Group */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sibling Grouping
        </p>
        <Field label="Sibling Group ID">
          <Input
            data-ocid="student_edit.sibling_group.input"
            value={form.siblingGroup}
            onChange={(e) => setField("siblingGroup", e.target.value)}
            placeholder="e.g. 1 (shared with siblings)"
          />
        </Field>
        <p className="text-xs text-muted-foreground">
          Students with the same Sibling Group ID will have their fees bundled
          together.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-8">
        <Button
          data-ocid="student_edit.cancel_button"
          variant="outline"
          onClick={() => navigate({ to: "/students/$id", params: { id } })}
          disabled={updateStudent.isPending}
        >
          Cancel
        </Button>
        <Button
          data-ocid="student_edit.save_button"
          onClick={handleSave}
          disabled={updateStudent.isPending}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {updateStudent.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
