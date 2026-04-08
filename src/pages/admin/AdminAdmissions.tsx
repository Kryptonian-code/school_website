import { useCallback, useEffect, useState } from "react";
import { FileText, Phone, Search, ShieldCheck, UserRound } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { AdmissionApplication, PaginationMeta } from "@/types/content";
import {
  AdminEmptyState,
  AdminExportButton,
  AdminPage,
  AdminPanelHeader,
  AdminStatusBadge,
  AdminSurface,
  AdminTablePagination,
  adminSelectClassName,
} from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

const statuses = ["pending", "reviewing", "approved", "waitlisted", "declined"];
const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, page_count: 1 };

const statusToneMap: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  pending: "warning",
  reviewing: "info",
  approved: "success",
  waitlisted: "neutral",
  declined: "danger",
};

const AdminAdmissions = () => {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const { toast } = useToast();

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getAdmissions({ page, limit: 10, search: query });
      setApplications(response.items);
      setPagination(response.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchApplications().catch(() => undefined);
  }, [fetchApplications]);

  useEffect(() => {
    setFeedbackDraft(selectedApplication?.admin_feedback || "");
  }, [selectedApplication]);

  const updateStatus = async (application: AdmissionApplication, status: string) => {
    await api.updateAdmission(application.id, { status });
    toast({ title: `Application marked ${status}` });

    setApplications((current) =>
      current.map((item) => (item.id === application.id ? { ...item, status } : item)),
    );
    setSelectedApplication((current) =>
      current?.id === application.id ? { ...current, status } : current,
    );
  };

  const saveFeedback = async () => {
    if (!selectedApplication) return;

    await api.updateAdmission(selectedApplication.id, {
      status: selectedApplication.status,
      admin_feedback: feedbackDraft,
    });

    toast({ title: "Review feedback saved" });

    setApplications((current) =>
      current.map((item) =>
        item.id === selectedApplication.id ? { ...item, admin_feedback: feedbackDraft } : item,
      ),
    );
    setSelectedApplication((current) =>
      current ? { ...current, admin_feedback: feedbackDraft } : current,
    );
  };

  return (
    <AdminPage
      title="Admission Applications"
      description="Review student applications submitted through the public admissions form and keep the admissions pipeline organised."
      eyebrow="Admissions desk"
      action={(
        <AdminExportButton entity="admissions" />
      )}
    >
      <AdminSurface>
        <AdminPanelHeader
          title="Application queue"
          description={`${pagination.total} application${pagination.total === 1 ? "" : "s"} currently match your view.`}
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
                placeholder="Search applicants, parent names, class..."
              />
            </div>
          )}
        />

        {loading ? (
          <AdminEmptyState
            icon={ShieldCheck}
            title="Loading applications..."
            description="Fetching the latest admissions records."
          />
        ) : applications.length === 0 ? (
          <AdminEmptyState
            icon={ShieldCheck}
            title={query ? "No applications match your search" : "No applications yet"}
            description={
              !query
                ? "Applications submitted from the public admissions page will appear here for review."
                : "Try a different keyword to find the applicant you are looking for."
            }
          />
        ) : (
          <>
            <div className="grid gap-3 p-4 md:hidden">
              {applications.map((application) => (
                <div key={application.id} className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">
                        {application.student_first_name} {application.student_last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{application.application_number}</p>
                    </div>
                    <AdminStatusBadge tone={statusToneMap[application.status] ?? "neutral"}>
                      {application.status}
                    </AdminStatusBadge>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Class:</span> {application.class_applying}</p>
                    <p><span className="font-medium text-foreground">Parent:</span> {application.parent_name}</p>
                    <p><span className="font-medium text-foreground">Phone:</span> {application.parent_phone}</p>
                    <p><span className="font-medium text-foreground">Submitted:</span> {format(new Date(application.created_at), "dd MMM yyyy")}</p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <Button variant="outline" className="w-full rounded-xl" onClick={() => setSelectedApplication(application)}>
                      Open Application
                    </Button>
                    <select
                      className={cn(adminSelectClassName, "h-10")}
                      value={application.status}
                      onChange={(event) => updateStatus(application, event.target.value)}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Parent / Contact</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {application.student_first_name} {application.student_last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">{application.application_number}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div>{application.class_applying}</div>
                        <div className="mt-1 text-xs">{application.term_applying}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div>{application.parent_name}</div>
                        <div className="mt-1 text-xs">{application.parent_phone}</div>
                        <div className="text-xs">{application.email}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(application.created_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge tone={statusToneMap[application.status] ?? "neutral"}>
                          {application.status}
                        </AdminStatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setSelectedApplication(application)}>
                            Open
                          </Button>
                          <select
                            className={cn(adminSelectClassName, "h-10 w-[10.5rem]")}
                            value={application.status}
                            onChange={(event) => updateStatus(application, event.target.value)}
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
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

      <Dialog open={Boolean(selectedApplication)} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto rounded-[1.5rem] border border-border/70 bg-background/95 p-0">
          {selectedApplication ? (
            <>
              <DialogHeader className="border-b border-border/70 px-5 py-4 text-left sm:px-6">
                <DialogTitle className="text-left text-xl">
                  {selectedApplication.student_first_name} {selectedApplication.student_last_name}
                </DialogTitle>
                <DialogDescription className="text-left">
                  Application {selectedApplication.application_number} for {selectedApplication.class_applying}.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.8fr)]">
                <div className="space-y-5">
                  <div className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <UserRound className="h-4 w-4 text-primary" />
                      Student details
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailItem label="Date of Birth" value={selectedApplication.date_of_birth} />
                      <DetailItem label="Gender" value={selectedApplication.gender} />
                      <DetailItem label="Class Applying" value={selectedApplication.class_applying} />
                      <DetailItem label="Term / Intake" value={selectedApplication.term_applying} />
                      <DetailItem label="Previous School" value={selectedApplication.previous_school || "-"} className="sm:col-span-2" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Phone className="h-4 w-4 text-primary" />
                      Parent / guardian details
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailItem label="Parent / Guardian" value={selectedApplication.parent_name} />
                      <DetailItem label="Relationship" value={selectedApplication.parent_relationship} />
                      <DetailItem label="Primary Phone" value={selectedApplication.parent_phone} />
                      <DetailItem label="Alternate Phone" value={selectedApplication.alternate_phone || "-"} />
                      <DetailItem label="Email Address" value={selectedApplication.email} className="sm:col-span-2" />
                      <DetailItem label="Residential Address" value={`${selectedApplication.address}, ${selectedApplication.city}`} className="sm:col-span-2" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <FileText className="h-4 w-4 text-primary" />
                      Submitted notes
                    </div>
                    <div className="space-y-3">
                      <DetailBlock label="Medical Information" value={selectedApplication.medical_information || "No medical information provided."} />
                      <DetailBlock label="Additional Notes" value={selectedApplication.notes || "No additional notes provided."} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <FileText className="h-4 w-4 text-primary" />
                      Admissions team feedback
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground">Internal review notes</label>
                      <Textarea
                        value={feedbackDraft}
                        onChange={(event) => setFeedbackDraft(event.target.value)}
                        rows={6}
                        placeholder="Add your internal review notes, follow-up summary, or decision rationale here."
                      />
                      <Button className="rounded-xl" onClick={saveFeedback}>
                        Save Feedback
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-foreground">Review actions</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Open each application to review the full record before changing its status.
                    </p>
                    <div className="mt-4 space-y-3">
                      <DetailItem label="Submitted" value={format(new Date(selectedApplication.created_at), "dd MMM yyyy, hh:mm a")} />
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Application Status</label>
                        <select
                          className={adminSelectClassName}
                          value={selectedApplication.status}
                          onChange={(event) => updateStatus(selectedApplication, event.target.value)}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
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

function DetailItem({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}

export default AdminAdmissions;
