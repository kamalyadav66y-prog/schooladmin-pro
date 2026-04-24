import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  Backend,
  Attendance as BackendAttendance,
  AttendanceInput as BackendAttendanceInput,
  AttendanceStatus as BackendAttendanceStatus,
} from "../backend";
import type { Attendance, AttendanceInput } from "../types";

function mapAttendanceStatus(s: BackendAttendanceStatus): "present" | "absent" {
  if (s === "present") return "present";
  return "absent";
}

function toBackendAttendanceStatus(s: string): BackendAttendanceStatus {
  // AttendanceStatus is an enum: "present" | "absent"
  return s === "present"
    ? ("present" as BackendAttendanceStatus)
    : ("absent" as BackendAttendanceStatus);
}

function mapAttendance(a: BackendAttendance): Attendance {
  return {
    id: a.id.toString(),
    teacherId: a.teacherId.toString(),
    teacherName: "",
    date: a.date,
    status: mapAttendanceStatus(a.status),
    checkIn: "",
    checkOut: "",
    remarks: a.notes,
    createdAt: a.createdAt,
    updatedAt: a.createdAt,
  };
}

function toBackendAttendanceInput(
  input: AttendanceInput,
): BackendAttendanceInput {
  return {
    teacherId: BigInt(input.teacherId),
    date: input.date,
    status: toBackendAttendanceStatus(input.status),
    notes: input.remarks,
  };
}

const today = new Date().toISOString().split("T")[0];

const mockAttendances: Attendance[] = [
  {
    id: "1",
    teacherId: "1",
    teacherName: "Mrs. Sunita Verma",
    date: today,
    status: "present",
    checkIn: "08:30",
    checkOut: "16:30",
    remarks: "",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "2",
    teacherId: "2",
    teacherName: "Mr. Ramesh Kumar",
    date: today,
    status: "present",
    checkIn: "08:45",
    checkOut: "16:30",
    remarks: "",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "3",
    teacherId: "3",
    teacherName: "Ms. Preethi Nair",
    date: today,
    status: "absent",
    checkIn: "",
    checkOut: "",
    remarks: "Sick leave",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "4",
    teacherId: "4",
    teacherName: "Mr. Arun Pillai",
    date: today,
    status: "present",
    checkIn: "10:00",
    checkOut: "16:30",
    remarks: "Traffic delay",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
];

export function useAttendances() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Attendance[]>({
    queryKey: ["attendances"],
    queryFn: async () => {
      if (!actor) return mockAttendances;
      try {
        const result = await actor.listAttendances();
        return result.map(mapAttendance);
      } catch {
        return mockAttendances;
      }
    },
    enabled: !isFetching,
  });
}

export function useAttendancesByTeacher(teacherId: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Attendance[]>({
    queryKey: ["attendances", "teacher", teacherId],
    queryFn: async () => {
      if (!actor || !teacherId) return [];
      try {
        const result = await actor.listAttendancesByTeacher(BigInt(teacherId));
        return result.map(mapAttendance);
      } catch {
        return mockAttendances.filter((a) => a.teacherId === teacherId);
      }
    },
    enabled: !isFetching && !!teacherId,
  });
}

export function useAttendancesByDate(date: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Attendance[]>({
    queryKey: ["attendances", "date", date],
    queryFn: async () => {
      if (!actor || !date) return [];
      try {
        const result = await actor.listAttendancesByDate(date);
        return result.map(mapAttendance);
      } catch {
        return mockAttendances.filter((a) => a.date === date);
      }
    },
    enabled: !isFetching && !!date,
  });
}

export function useAttendance(id: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Attendance | null>({
    queryKey: ["attendances", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        const result = await actor.getAttendance(BigInt(id));
        return result ? mapAttendance(result) : null;
      } catch {
        return mockAttendances.find((a) => a.id === id) ?? null;
      }
    },
    enabled: !isFetching && !!id,
  });
}

export function useAddAttendance() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AttendanceInput) => {
      if (!actor) throw new Error("Actor not available");
      const id = await actor.addAttendance(toBackendAttendanceInput(input));
      return {
        ...input,
        id: id.toString(),
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      } as Attendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
    },
  });
}

export function useUpdateAttendance() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: string; input: AttendanceInput }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateAttendance(BigInt(id), toBackendAttendanceInput(input));
      return {
        ...input,
        id,
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      } as Attendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
    },
  });
}

export function useDeleteAttendance() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteAttendance(BigInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
    },
  });
}
