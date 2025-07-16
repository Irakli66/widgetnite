// hooks/useRequest.ts
import useSWR, { SWRConfiguration } from "swr";

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function useRequest<T>(url: string, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, config);

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
