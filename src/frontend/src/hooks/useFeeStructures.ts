import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  Backend,
  FeeStructure as BackendFeeStructure,
  FeeStructureInput as BackendFeeStructureInput,
} from "../backend";
import type { FeeStructure, FeeStructureInput } from "../types";

function mapFeeStructure(fs: BackendFeeStructure): FeeStructure {
  return {
    id: fs.id.toString(),
    className: fs.classGrade,
    grade: fs.classGrade,
    academicYear: fs.effectiveFrom.substring(0, 4),
    tuitionFee: Number(fs.tuitionFee),
    travelFee: Number(fs.transportFee),
    labFee: 0,
    libraryFee: 0,
    sportsFee: Number(fs.activityFee),
    otherFee: Number(fs.otherFee),
    totalFee:
      Number(fs.tuitionFee) +
      Number(fs.transportFee) +
      Number(fs.activityFee) +
      Number(fs.otherFee),
    createdAt: BigInt(0),
    updatedAt: BigInt(0),
  };
}

function toBackendFeeStructureInput(
  input: FeeStructureInput,
): BackendFeeStructureInput {
  return {
    classGrade: input.className,
    tuitionFee: BigInt(Math.round(input.tuitionFee)),
    transportFee: BigInt(Math.round(input.travelFee)),
    activityFee: BigInt(Math.round(input.sportsFee)),
    otherFee: BigInt(Math.round(input.otherFee)),
    effectiveFrom: `${input.academicYear}-01-01`,
  };
}

const mockFeeStructures: FeeStructure[] = [
  {
    id: "1",
    className: "Class 1",
    grade: "Class 1",
    academicYear: "2025",
    tuitionFee: 12000,
    travelFee: 1000,
    labFee: 500,
    libraryFee: 300,
    sportsFee: 400,
    otherFee: 200,
    totalFee: 14400,
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "2",
    className: "Class 3",
    grade: "Class 3",
    academicYear: "2025",
    tuitionFee: 14000,
    travelFee: 1200,
    labFee: 800,
    libraryFee: 400,
    sportsFee: 500,
    otherFee: 300,
    totalFee: 17200,
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "3",
    className: "Class 5",
    grade: "Class 5",
    academicYear: "2025",
    tuitionFee: 16000,
    travelFee: 1200,
    labFee: 1000,
    libraryFee: 500,
    sportsFee: 600,
    otherFee: 400,
    totalFee: 19700,
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "4",
    className: "Class 7",
    grade: "Class 7",
    academicYear: "2025",
    tuitionFee: 18000,
    travelFee: 1800,
    labFee: 1500,
    libraryFee: 600,
    sportsFee: 700,
    otherFee: 500,
    totalFee: 23100,
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
];

export function useFeeStructures() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<FeeStructure[]>({
    queryKey: ["feeStructures"],
    queryFn: async () => {
      if (!actor) return mockFeeStructures;
      try {
        const result = await actor.listFeeStructures();
        return result.map(mapFeeStructure);
      } catch {
        return mockFeeStructures;
      }
    },
    enabled: !isFetching,
  });
}

export function useFeeStructure(id: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<FeeStructure | null>({
    queryKey: ["feeStructures", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        const result = await actor.getFeeStructure(BigInt(id));
        return result ? mapFeeStructure(result) : null;
      } catch {
        return mockFeeStructures.find((fs) => fs.id === id) ?? null;
      }
    },
    enabled: !isFetching && !!id,
  });
}

export function useFeeStructureByClass(classGrade: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<FeeStructure | null>({
    queryKey: ["feeStructures", "class", classGrade],
    queryFn: async () => {
      if (!actor || !classGrade) return null;
      try {
        const result = await actor.getFeeStructureByClass(classGrade);
        return result ? mapFeeStructure(result) : null;
      } catch {
        return (
          mockFeeStructures.find((fs) => fs.className === classGrade) ?? null
        );
      }
    },
    enabled: !isFetching && !!classGrade,
  });
}

export function useAddFeeStructure() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: FeeStructureInput) => {
      if (!actor) throw new Error("Actor not available");
      const id = await actor.addFeeStructure(toBackendFeeStructureInput(input));
      return {
        ...input,
        id: id.toString(),
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      } as FeeStructure;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeStructures"] });
    },
  });
}

export function useUpdateFeeStructure() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: string; input: FeeStructureInput }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateFeeStructure(
        BigInt(id),
        toBackendFeeStructureInput(input),
      );
      return {
        ...input,
        id,
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      } as FeeStructure;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeStructures"] });
    },
  });
}

export function useDeleteFeeStructure() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteFeeStructure(BigInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeStructures"] });
    },
  });
}
