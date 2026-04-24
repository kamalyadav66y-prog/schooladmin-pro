import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAddAttendance,
  useAttendances,
  useAttendancesByDate,
  useUpdateAttendance,
} from "@/hooks/useAttendances";
import { useStudents } from "@/hooks/useStudents";
import { useTeachers } from "@/hooks/useTeachers";
import type { Attendance, AttendanceStatus, Teacher } from "@/types";
import { CheckCircle2, Users, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const today = new Date().toISOString().split("T")[0];

// --- Mark Attendance Tab ---

interface TeacherAttendanceRow {
  teacher: Teacher;
  attendance: Attendance | null;
  status: "present" | "absent" | null;
}

function MarkAttendanceTab() {
  const [date, setDate] = useState(today);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [localStatus, setLocalStatus] = useState<
    Record<string, "present" | "absent">
  >({});

  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();
  const { data: students = [] } = useStudents();
  const { data: dateAttendances = [], isLoading: loadingAttendance } =
    useAttendancesByDate(date);

  const addAttendance = useAddAttendance();
  const updateAttendance = useUpdateAttendance();

  // Unique classes from teachers + students
  const classes = useMemo(() => {
    const fromTeachers = teachers.map((t) => t.className).filter(Boolean);
    const fromStudents = students.map((s) => s.className).filter(Boolean);
    return Array.from(new Set([...fromTeachers, ...fromStudents])).sort();
  }, [teachers, students]);

  // Teachers in selected class
  const classTeachers = useMemo(() => {
    if (!selectedClass) return teachers;
    return teachers.filter(
      (t) =>
        t.className === selectedClass || t.className.includes(selectedClass),
    );
  }, [teachers, selectedClass]);

  // Build rows with attendance data
  const rows: TeacherAttendanceRow[] = useMemo(() => {
    return classTeachers.map((teacher) => {
      const existing =
        dateAttendances.find((a) => a.teacherId === teacher.id) ?? null;
      const currentStatus =
        localStatus[teacher.id] ??
        (existing ? (existing.status as "present" | "absent") : null);
      return { teacher, attendance: existing, status: currentStatus };
    });
  }, [classTeachers, dateAttendances, localStatus]);

  // Reset local status when date/class changes
  function handleDateChange(newDate: string) {
    setDate(newDate);
    setLocalStatus({});
  }

  function handleClassChange(newClass: string) {
    setSelectedClass(newClass);
    setLocalStatus({});
  }

  async function toggleStatus(
    teacher: Teacher,
    newStatus: "present" | "absent",
  ) {
    setLocalStatus((prev) => ({ ...prev, [teacher.id]: newStatus }));

    const existing = dateAttendances.find((a) => a.teacherId === teacher.id);
    const input = {
      teacherId: teacher.id,
      teacherName: teacher.name,
      date,
      status: newStatus as AttendanceStatus,
      checkIn: "",
      checkOut: "",
      remarks: "",
    };

    try {
      if (existing) {
        await updateAttendance.mutateAsync({ id: existing.id, input });
      } else {
        await addAttendance.mutateAsync(input);
      }
    } catch {
      toast.error("Failed to save attendance");
      setLocalStatus((prev) => {
        const next = { ...prev };
        delete next[teacher.id];
        return next;
      });
    }
  }

  async function markAll(status: "present" | "absent") {
    const updates: Record<string, "present" | "absent"> = {};
    for (const t of classTeachers) updates[t.id] = status;
    setLocalStatus(updates);

    const results = classTeachers.map(async (teacher) => {
      const existing = dateAttendances.find((a) => a.teacherId === teacher.id);
      const input = {
        teacherId: teacher.id,
        teacherName: teacher.name,
        date,
        status: status as AttendanceStatus,
        checkIn: "",
        checkOut: "",
        remarks: "",
      };
      if (existing) {
        return updateAttendance.mutateAsync({ id: existing.id, input });
      }
      return addAttendance.mutateAsync(input);
    });

    try {
      await Promise.all(results);
      toast.success(`All teachers marked as ${status}`);
    } catch {
      toast.error("Some attendance records failed to save");
    }
  }

  const isLoading = loadingTeachers || loadingAttendance;
  const presentCount = rows.filter((r) => r.status === "present").length;
  const absentCount = rows.filter((r) => r.status === "absent").length;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="attendance-date">Date</Label>
            <input
              id="attendance-date"
              data-ocid="attendance.date_input"
              type="date"
              value={date}
              max={today}
              onChange={(e) => handleDateChange(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5 min-w-[180px]">
            <Label>Class Filter</Label>
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger data-ocid="attendance.class_select">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button
              data-ocid="attendance.mark_all_present_button"
              variant="outline"
              size="sm"
              className="gap-1.5 border-success/50 text-success hover:bg-success/10"
              onClick={() => markAll("present")}
              disabled={classTeachers.length === 0}
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark All Present
            </Button>
            <Button
              data-ocid="attendance.mark_all_absent_button"
              variant="outline"
              size="sm"
              className="gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => markAll("absent")}
              disabled={classTeachers.length === 0}
            >
              <XCircle className="w-4 h-4" />
              Mark All Absent
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Total Teachers</p>
            <p className="text-xl font-semibold font-display">
              {classTeachers.length}
            </p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <div>
            <p className="text-xs text-muted-foreground">Present</p>
            <p className="text-xl font-semibold font-display text-success">
              {presentCount}
            </p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <XCircle className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-xs text-muted-foreground">Absent</p>
            <p className="text-xl font-semibold font-display text-destructive">
              {absentCount}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div
            data-ocid="attendance.mark.empty_state"
            className="flex flex-col items-center gap-2 py-12 text-muted-foreground"
          >
            <span className="text-4xl">📋</span>
            <p className="text-sm font-medium text-foreground">
              No teachers found
            </p>
            <p className="text-xs">Select a class or add teachers first</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((row, idx) => (
              <div
                key={row.teacher.id}
                data-ocid={`attendance.row.${idx + 1}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {row.teacher.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.teacher.subject}
                    {row.teacher.className ? ` · ${row.teacher.className}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    data-ocid={`attendance.present_toggle.${idx + 1}`}
                    size="sm"
                    variant={row.status === "present" ? "default" : "outline"}
                    className={
                      row.status === "present"
                        ? "bg-success hover:bg-success/90 text-success-foreground border-success gap-1.5"
                        : "border-success/40 text-success hover:bg-success/10 gap-1.5"
                    }
                    onClick={() => toggleStatus(row.teacher, "present")}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Present
                  </Button>
                  <Button
                    data-ocid={`attendance.absent_toggle.${idx + 1}`}
                    size="sm"
                    variant={row.status === "absent" ? "default" : "outline"}
                    className={
                      row.status === "absent"
                        ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive gap-1.5"
                        : "border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5"
                    }
                    onClick={() => toggleStatus(row.teacher, "absent")}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Absent
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- History Tab ---

interface EnrichedAttendance extends Attendance {
  teacherClass: string;
}

function HistoryTab() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(today);
  const [teacherFilter, setTeacherFilter] = useState<string>("");

  const { data: allAttendances = [], isLoading } = useAttendances();
  const { data: teachers = [] } = useTeachers();

  const filtered = useMemo(() => {
    return allAttendances.filter((a) => {
      const inRange = a.date >= startDate && a.date <= endDate;
      const matchTeacher = !teacherFilter || a.teacherId === teacherFilter;
      return inRange && matchTeacher;
    });
  }, [allAttendances, startDate, endDate, teacherFilter]);

  const enriched: EnrichedAttendance[] = useMemo(() => {
    return filtered.map((a) => {
      const teacher = teachers.find((t) => t.id === a.teacherId);
      return {
        ...a,
        teacherName: teacher?.name ?? a.teacherName ?? "Unknown",
        teacherClass: teacher?.className ?? "",
      };
    });
  }, [filtered, teachers]);

  const historyColumns = [
    {
      key: "teacher",
      header: "Teacher",
      cell: (a: EnrichedAttendance) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{a.teacherName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {a.teacherClass}
          </p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (a: EnrichedAttendance) => (
        <span className="text-sm">
          {new Date(a.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (a: EnrichedAttendance) => (
        <span
          className={
            a.status === "present"
              ? "attendance-badge-present"
              : "attendance-badge-absent"
          }
        >
          {a.status === "present" ? "Present" : "Absent"}
        </span>
      ),
    },
    {
      key: "remarks",
      header: "Remarks",
      cell: (a: EnrichedAttendance) => (
        <span className="text-sm text-muted-foreground">
          {a.remarks || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="history-start">From</Label>
            <input
              id="history-start"
              data-ocid="attendance.history_start_input"
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="history-end">To</Label>
            <input
              id="history-end"
              data-ocid="attendance.history_end_input"
              type="date"
              value={endDate}
              min={startDate}
              max={today}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5 min-w-[200px]">
            <Label>Teacher</Label>
            <Select value={teacherFilter} onValueChange={setTeacherFilter}>
              <SelectTrigger data-ocid="attendance.history_teacher_select">
                <SelectValue placeholder="All teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All teachers</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto self-end">
            <p className="text-sm text-muted-foreground">
              {enriched.length} record{enriched.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <DataTable
          columns={historyColumns}
          data={enriched}
          isLoading={isLoading}
          keyExtractor={(a, i) => `${a.id}-${i}`}
          emptyState={
            <div
              data-ocid="attendance.history.empty_state"
              className="flex flex-col items-center gap-2 py-8"
            >
              <span className="text-4xl">🗓️</span>
              <p className="text-sm font-medium">No attendance records</p>
              <p className="text-xs text-muted-foreground">
                Adjust the date range or teacher filter
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
}

// --- Main Page ---

export default function AttendancePage() {
  return (
    <div data-ocid="attendance.page" className="space-y-6">
      <PageHeader
        title="Teacher Attendance"
        description="Track daily attendance for all teaching staff"
      />

      <Tabs defaultValue="mark" className="space-y-6">
        <TabsList className="bg-muted/40 border border-border">
          <TabsTrigger
            data-ocid="attendance.mark_tab"
            value="mark"
            className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger
            data-ocid="attendance.history_tab"
            value="history"
            className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Attendance History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mark">
          <MarkAttendanceTab />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
