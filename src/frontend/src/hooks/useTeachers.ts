import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  Backend,
  Teacher as BackendTeacher,
  TeacherInput as BackendTeacherInput,
} from "../backend";
import type { Teacher, TeacherInput } from "../types";

function mapTeacher(t: BackendTeacher): Teacher {
  return {
    id: t.id.toString(),
    name: t.name,
    subject: t.subject,
    className: t.classAssigned,
    createdAt: t.createdAt,
    updatedAt: t.createdAt,
  };
}

function toBackendTeacherInput(input: TeacherInput): BackendTeacherInput {
  return {
    name: input.name,
    subject: input.subject,
    classAssigned: input.className,
  };
}

const mockTeachers: Teacher[] = [
  {
    id: "1",
    name: "Mrs. Sunita Verma",
    subject: "Mathematics",
    className: "Class 5, Class 6",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "2",
    name: "Mr. Ramesh Kumar",
    subject: "Science",
    className: "Class 6, Class 7",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "3",
    name: "Ms. Preethi Nair",
    subject: "English",
    className: "Class 3, Class 4",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "4",
    name: "Mr. Arun Pillai",
    subject: "Social Studies",
    className: "Class 7, Class 8",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
];

export function useTeachers() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Teacher[]>({
    queryKey: ["teachers"],
    queryFn: async () => {
      if (!actor) return mockTeachers;
      try {
        const result = await actor.listTeachers();
        return result.map(mapTeacher);
      } catch {
        return mockTeachers;
      }
    },
    enabled: !isFetching,
  });
}

export function useTeacher(id: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Teacher | null>({
    queryKey: ["teachers", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        const result = await actor.getTeacher(BigInt(id));
        return result ? mapTeacher(result) : null;
      } catch {
        return mockTeachers.find((t) => t.id === id) ?? null;
      }
    },
    enabled: !isFetching && !!id,
  });
}

export function useAddTeacher() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TeacherInput) => {
      if (!actor) throw new Error("Actor not available");
      const id = await actor.addTeacher(toBackendTeacherInput(input));
      return {
        ...input,
        id: id.toString(),
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      } as Teacher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useUpdateTeacher() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TeacherInput }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateTeacher(BigInt(id), toBackendTeacherInput(input));
      return {
        ...input,
        id,
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      } as Teacher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useDeleteTeacher() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTeacher(BigInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}
