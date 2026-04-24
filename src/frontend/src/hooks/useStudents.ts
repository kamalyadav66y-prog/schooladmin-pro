import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  Backend,
  Student as BackendStudent,
  StudentInput as BackendStudentInput,
} from "../backend";
import type { Student, StudentInput } from "../types";

// Map backend Student to frontend Student type
function mapStudent(s: BackendStudent): Student {
  return {
    id: s.id.toString(),
    name: s.name,
    dob: s.dob,
    address: s.address,
    className: s.classGrade,
    grade: s.classGrade,
    parentName: s.parentName,
    parentContact: s.parentContact,
    parentEmail: s.parentEmail,
    siblingGroup: s.siblingGroupId != null ? s.siblingGroupId.toString() : "",
    travelFee: 0,
    enrollmentDate: "",
    createdAt: s.createdAt,
    updatedAt: s.createdAt,
  };
}

function toBackendStudentInput(input: StudentInput): BackendStudentInput {
  return {
    name: input.name,
    dob: input.dob,
    address: input.address,
    classGrade: input.className,
    parentName: input.parentName,
    parentContact: input.parentContact,
    parentEmail: input.parentEmail,
    siblingGroupId: input.siblingGroup ? BigInt(input.siblingGroup) : undefined,
    rollNumber: "",
  };
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Arjun Sharma",
    dob: "2012-03-15",
    address: "123 Park Street, Mumbai",
    className: "Class 5",
    grade: "Class 5",
    parentName: "Rajesh Sharma",
    parentContact: "+91-98765-43210",
    parentEmail: "rajesh.sharma@gmail.com",
    siblingGroup: "1",
    travelFee: 1200,
    enrollmentDate: "2020-06-01",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "2",
    name: "Priya Sharma",
    dob: "2014-07-20",
    address: "123 Park Street, Mumbai",
    className: "Class 3",
    grade: "Class 3",
    parentName: "Rajesh Sharma",
    parentContact: "+91-98765-43210",
    parentEmail: "rajesh.sharma@gmail.com",
    siblingGroup: "1",
    travelFee: 1200,
    enrollmentDate: "2022-06-01",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "3",
    name: "Rohan Mehta",
    dob: "2011-11-05",
    address: "45 Lake View, Pune",
    className: "Class 6",
    grade: "Class 6",
    parentName: "Suresh Mehta",
    parentContact: "+91-87654-32109",
    parentEmail: "suresh.mehta@gmail.com",
    siblingGroup: "2",
    travelFee: 1500,
    enrollmentDate: "2019-06-01",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "4",
    name: "Anika Patel",
    dob: "2013-04-12",
    address: "78 Green Nagar, Ahmedabad",
    className: "Class 4",
    grade: "Class 4",
    parentName: "Dinesh Patel",
    parentContact: "+91-76543-21098",
    parentEmail: "dinesh.patel@gmail.com",
    siblingGroup: "3",
    travelFee: 1000,
    enrollmentDate: "2021-06-01",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "5",
    name: "Vikram Singh",
    dob: "2010-08-28",
    address: "22 Hill Road, Delhi",
    className: "Class 7",
    grade: "Class 7",
    parentName: "Harpal Singh",
    parentContact: "+91-65432-10987",
    parentEmail: "harpal.singh@gmail.com",
    siblingGroup: "4",
    travelFee: 1800,
    enrollmentDate: "2018-06-01",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
];

export function useStudents() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return mockStudents;
      try {
        const result = await actor.listStudents();
        return result.map(mapStudent);
      } catch {
        return mockStudents;
      }
    },
    enabled: !isFetching,
  });
}

export function useStudentsByClass(className: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Student[]>({
    queryKey: ["students", "class", className],
    queryFn: async () => {
      if (!actor || !className) return [];
      try {
        const result = await actor.listStudentsByClass(className);
        return result.map(mapStudent);
      } catch {
        return mockStudents.filter((s) => s.className === className);
      }
    },
    enabled: !isFetching && !!className,
  });
}

export function useSearchStudents(query: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Student[]>({
    queryKey: ["students", "search", query],
    queryFn: async () => {
      if (!actor || !query) return [];
      try {
        const result = await actor.searchStudents(query);
        return result.map(mapStudent);
      } catch {
        const q = query.toLowerCase();
        return mockStudents.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.parentName.toLowerCase().includes(q) ||
            s.className.toLowerCase().includes(q),
        );
      }
    },
    enabled: !isFetching && query.length > 1,
  });
}

export function useStudent(id: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<Student | null>({
    queryKey: ["students", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        const result = await actor.getStudent(BigInt(id));
        return result ? mapStudent(result) : null;
      } catch {
        return mockStudents.find((s) => s.id === id) ?? null;
      }
    },
    enabled: !isFetching && !!id,
  });
}

export function useSiblingGroupFeeTotal(siblingGroup: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<number>({
    queryKey: ["siblingGroupFee", siblingGroup],
    queryFn: async () => {
      if (!actor || !siblingGroup) return 0;
      try {
        const result = await actor.getSiblingGroupFeeTotal(
          BigInt(siblingGroup),
          BigInt(new Date().getMonth() + 1),
          BigInt(new Date().getFullYear()),
        );
        return Number(result);
      } catch {
        return 0;
      }
    },
    enabled: !isFetching && !!siblingGroup,
  });
}

export function useAddStudent() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: StudentInput) => {
      if (!actor) throw new Error("Actor not available");
      const id = await actor.addStudent(toBackendStudentInput(input));
      return {
        ...input,
        id: id.toString(),
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      } as Student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudent() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: StudentInput }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateStudent(BigInt(id), toBackendStudentInput(input));
      return {
        ...input,
        id,
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      } as Student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteStudent(BigInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
