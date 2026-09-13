import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTanStackData,
  postTanStackData,
  deleteTanStackData,
  putTanStackData,
  patchTanStackData,
} from "@/services/nestedPageService";

const useNestedPageExample = () => {
  const queryClient = useQueryClient();

  const getTSData = (): {
    error: unknown;
    data: unknown;
    isFetching: boolean;
  } => {
    const { error, data, isFetching } = useQuery({
      queryKey: ["repoData"],
      queryFn: getTanStackData,
      retry: 3,
      staleTime: 5000, // Os dados são considerados frescos por 5 segundos
    });
    return { error, data, isFetching };
  };

  const postTSData = useMutation({
    //passing params to the mutation function
    mutationFn: postTanStackData,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["repoData"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTanStackData,
    onSuccess: (data) => {
      console.log("Delete success:", data);
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  const putMutation = useMutation({
    mutationFn: putTanStackData,
    onSuccess: (data) => {
      console.log("PUT success:", data);
    },
    onError: (error) => {
      console.error("PUT error:", error);
    },
  });

  const patchMutation = useMutation({
    mutationFn: patchTanStackData,
    onSuccess: (data) => {
      console.log("PATCH success:", data);
    },
    onError: (error) => {
      console.error("PATCH error:", error);
    },
  });

  return {
    tsData: getTSData(),
    postTSData: postTSData.mutate,
    isPosting: postTSData.isPending,
    deleteTSData: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    putTSData: putMutation.mutate,
    isPutting: putMutation.isPending,
    patchTSData: patchMutation.mutate,
    isPatching: patchMutation.isPending,
  };
};

export default useNestedPageExample;
