import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Activity, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import type { ActivityLogEntry, PaginationMeta } from "@/types/content";
import { AdminEmptyState, AdminPage, AdminPanelHeader, AdminSurface, AdminTablePagination } from "@/components/admin/AdminUI";

const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, page_count: 1 };

const actionLabels: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  settings_update: "Updated settings",
  user_create: "Created user",
  user_update: "Updated user",
  user_delete: "Deleted user",
  password_change: "Changed password",
};

function formatActionLabel(action: string) {
  return actionLabels[action] || action.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatEntityLabel(entityType: string, entityId: number | null) {
  const label = entityType.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
  return entityId ? `${label} #${entityId}` : label;
}

const AdminActivity = () => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getActivity({ page, limit: 12, search: query });
      setLogs(response.items);
      setPagination(response.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchLogs().catch(() => undefined);
  }, [fetchLogs]);

  return (
    <AdminPage
      title="Activity Log"
      description="Review recent admin activity across content, users, and configuration changes."
      eyebrow="Audit trail"
    >
      <AdminSurface>
        <AdminPanelHeader
          title="Recent activity"
          description={`${pagination.total} log entr${pagination.total === 1 ? "y" : "ies"} available.`}
          action={(
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setPage(1);
                      setQuery(searchInput.trim());
                    }
                  }}
                  className="pl-10"
                  placeholder="Search actions, users, or entities..."
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setPage(1);
                  setQuery(searchInput.trim());
                }}
              >
                Search
              </Button>
            </div>
          )}
        />

        {loading ? (
          <AdminEmptyState icon={Activity} title="Loading activity..." description="Fetching the latest admin activity records." />
        ) : logs.length === 0 ? (
          <AdminEmptyState
            icon={Activity}
            title={query ? "No activity matches your search" : "No activity recorded yet"}
            description={query ? "Try another keyword to find the event you need." : "Content, settings, and user changes will appear here as the team uses the CMS."}
          />
        ) : (
          <>
            <div className="grid gap-3 p-4 md:hidden">
              {logs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                  <p className="font-semibold text-foreground">{log.summary || `${formatActionLabel(log.action)} ${formatEntityLabel(log.entity_type, log.entity_id)}`}</p>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Action:</span> {formatActionLabel(log.action)}</p>
                    <p><span className="font-medium text-foreground">By:</span> {log.admin_username || "System"}</p>
                    <p><span className="font-medium text-foreground">Entity:</span> {formatEntityLabel(log.entity_type, log.entity_id)}</p>
                    <p><span className="font-medium text-foreground">When:</span> {format(new Date(log.created_at), "dd MMM yyyy 'at' hh:mm a")}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Summary</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium text-foreground">{log.summary || `${formatActionLabel(log.action)} ${formatEntityLabel(log.entity_type, log.entity_id)}`}</TableCell>
                      <TableCell className="text-muted-foreground">{formatActionLabel(log.action)}</TableCell>
                      <TableCell className="text-muted-foreground">{log.admin_username || "System"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatEntityLabel(log.entity_type, log.entity_id)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(log.created_at), "dd MMM yyyy 'at' hh:mm a")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <AdminTablePagination
          page={pagination.page}
          pageCount={pagination.page_count}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(pagination.page_count, current + 1))}
        />
      </AdminSurface>
    </AdminPage>
  );
};

export default AdminActivity;
