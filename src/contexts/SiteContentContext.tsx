import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SiteBootstrapData } from "@/types/content";
import { defaultSiteBootstrapData, normalizeSiteBootstrapData } from "@/lib/siteContent";

interface SiteContentContextValue {
  data: SiteBootstrapData;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
}

const SiteContentContext = createContext<SiteContentContextValue>({
  data: defaultSiteBootstrapData,
  isLoading: true,
  isError: false,
  refetch: async () => undefined,
});

interface SiteContentProviderProps {
  children: ReactNode;
  mode?: "full" | "settings";
}

export const SiteContentProvider = ({ children, mode = "full" }: SiteContentProviderProps) => {
  const query = useQuery({
    queryKey: ["site-bootstrap", mode],
    queryFn: () => api.getSiteBootstrap(mode),
  });

  return (
    <SiteContentContext.Provider
      value={{
        data: normalizeSiteBootstrapData(query.data),
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => useContext(SiteContentContext);
