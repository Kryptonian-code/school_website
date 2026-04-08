import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Mail, MailSearch, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Enquiry, PaginationMeta } from "@/types/content";
import {
  AdminEmptyState,
  AdminExportButton,
  AdminPage,
  AdminPanelHeader,
  AdminStatusBadge,
  AdminSurface,
  AdminTablePagination,
} from "@/components/admin/AdminUI";

const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, page_count: 1 };

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const { toast } = useToast();

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getEnquiries({ page, limit: 10, search: query });
      setEnquiries(response.items);
      setPagination(response.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchEnquiries().catch(() => undefined);
  }, [fetchEnquiries]);

  const toggleRead = async (enquiry: Enquiry) => {
    const nextReadState = enquiry.is_read ? 0 : 1;
    await api.updateEnquiry(enquiry.id, { is_read: nextReadState });
    toast({ title: enquiry.is_read ? "Marked as new" : "Marked as read" });

    setEnquiries((current) =>
      current.map((item) => (item.id === enquiry.id ? { ...item, is_read: nextReadState } : item)),
    );
    setSelectedEnquiry((current) =>
      current?.id === enquiry.id ? { ...current, is_read: nextReadState } : current,
    );
  };

  return (
    <AdminPage
      title="Enquiries"
      description="Track contact form messages from families and mark each enquiry as handled as your team responds."
      eyebrow="Communications"
      action={(
        <AdminExportButton entity="enquiries" />
      )}
    >
      <AdminSurface>
        <AdminPanelHeader
          title="Contact inbox"
          description={`${pagination.total} enquiry${pagination.total === 1 ? "" : "ies"} currently match your view.`}
          action={(
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
                placeholder="Search names, emails, subjects..."
              />
            </div>
          )}
        />

        {loading ? (
          <AdminEmptyState
            icon={MailSearch}
            title="Loading enquiries..."
            description="Fetching the latest contact messages from the public website."
          />
        ) : enquiries.length === 0 ? (
          <AdminEmptyState
            icon={MailSearch}
            title={query ? "No enquiries match your search" : "No enquiries yet"}
            description={
              !query
                ? "Messages submitted from the public contact form will appear here."
                : "Try another keyword to locate the message you need."
            }
          />
        ) : (
          <>
            <div className="grid gap-3 p-4 md:hidden">
              {enquiries.map((enquiry) => (
                <div key={enquiry.id} className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{enquiry.name}</p>
                      <p className="text-xs text-muted-foreground">{enquiry.subject || enquiry.type}</p>
                    </div>
                    <AdminStatusBadge tone={enquiry.is_read ? "neutral" : "danger"}>
                      {enquiry.is_read ? "Read" : "New"}
                    </AdminStatusBadge>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{enquiry.message}</p>

                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Email:</span> {enquiry.email}</p>
                    <p><span className="font-medium text-foreground">Date:</span> {format(new Date(enquiry.created_at), "dd MMM yyyy")}</p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <Button variant="outline" className="w-full rounded-xl" onClick={() => setSelectedEnquiry(enquiry)}>
                      Open Message
                    </Button>
                    <Button variant="outline" className="w-full rounded-xl" onClick={() => toggleRead(enquiry)}>
                      {enquiry.is_read ? "Mark New" : "Mark Read"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{enquiry.name}</div>
                          <div className="line-clamp-2 max-w-md text-xs leading-5 text-muted-foreground">
                            {enquiry.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{enquiry.email}</TableCell>
                      <TableCell className="text-muted-foreground">{enquiry.subject || enquiry.type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(enquiry.created_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge tone={enquiry.is_read ? "neutral" : "danger"}>
                          {enquiry.is_read ? "Read" : "New"}
                        </AdminStatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setSelectedEnquiry(enquiry)}>
                            Open
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toggleRead(enquiry)}>
                            {enquiry.is_read ? "Mark New" : "Mark Read"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <AdminTablePagination
          page={page}
          pageCount={pagination.page_count}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(pagination.page_count, current + 1))}
        />
      </AdminSurface>

      <Dialog open={Boolean(selectedEnquiry)} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto rounded-[1.5rem] border border-border/70 bg-background/95 p-0">
          {selectedEnquiry ? (
            <>
              <DialogHeader className="border-b border-border/70 px-5 py-4 text-left sm:px-6">
                <DialogTitle className="text-left text-xl">{selectedEnquiry.subject || "Website enquiry"}</DialogTitle>
                <DialogDescription className="text-left">
                  Message from {selectedEnquiry.name} received on {format(new Date(selectedEnquiry.created_at), "dd MMM yyyy, hh:mm a")}.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.8fr)]">
                <div className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    Message body
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{selectedEnquiry.message}</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <UserRound className="h-4 w-4 text-primary" />
                      Contact details
                    </div>
                    <div className="space-y-3">
                      <EnquiryDetail label="Name" value={selectedEnquiry.name} />
                      <EnquiryDetail label="Email" value={selectedEnquiry.email} />
                      <EnquiryDetail label="Phone" value={selectedEnquiry.phone || "-"} />
                      <EnquiryDetail label="Type" value={selectedEnquiry.type} />
                      <EnquiryDetail label="Date" value={format(new Date(selectedEnquiry.created_at), "dd MMM yyyy")} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-foreground">Inbox actions</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Open each message to read it fully before marking it as handled.
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <AdminStatusBadge tone={selectedEnquiry.is_read ? "neutral" : "danger"}>
                        {selectedEnquiry.is_read ? "Read" : "New"}
                      </AdminStatusBadge>
                      <Button variant="outline" className="rounded-xl" onClick={() => toggleRead(selectedEnquiry)}>
                        {selectedEnquiry.is_read ? "Mark New" : "Mark Read"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
};

function EnquiryDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

export default AdminEnquiries;
