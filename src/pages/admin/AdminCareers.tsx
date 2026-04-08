import { useCallback, useEffect, useState } from "react";
import { BriefcaseBusiness, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { CareerVacancy, PaginationMeta } from "@/types/content";
import {
  AdminBooleanRow,
  AdminDeleteButton,
  AdminEmptyState,
  AdminField,
  AdminFormSection,
  AdminPage,
  AdminPanelHeader,
  AdminStatusBadge,
  AdminSurface,
  AdminTablePagination,
  adminDialogContentClassName,
  adminFormClassName,
  adminIconButtonClassName,
  adminSelectClassName,
} from "@/components/admin/AdminUI";

const emptyForm = {
  title: "",
  slug: "",
  department: "",
  location: "",
  employment_type: "",
  experience_level: "",
  application_deadline: "",
  short_summary: "",
  full_description: "",
  requirements: "",
  application_email: "",
  external_application_url: "",
  status: "draft",
  hiring_status: "open",
  featured: false,
};

const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, page_count: 1 };

const AdminCareers = () => {
  const [items, setItems] = useState<CareerVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hiringStatusFilter, setHiringStatusFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CareerVacancy | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getCareers({
        page,
        limit: 10,
        search: query,
        status: statusFilter,
        hiring_status: hiringStatusFilter,
      });
      setItems(response.items);
      setPagination(response.pagination);
    } finally {
      setLoading(false);
    }
  }, [hiringStatusFilter, page, query, statusFilter]);

  useEffect(() => {
    fetchItems().catch(() => undefined);
  }, [fetchItems]);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    try {
      await api.saveCareer({
        ...form,
        slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-"),
      }, editing?.id);
      toast({ title: editing ? "Vacancy updated" : "Vacancy created" });
      setDialogOpen(false);
      resetForm();
      setPage(1);
      fetchItems();
    } catch (error) {
      toast({
        title: "Could not save vacancy",
        description: error instanceof Error ? error.message : "Please review the vacancy form and try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: CareerVacancy) => {
    setEditing(item);
    setForm({
      title: item.title,
      slug: item.slug,
      department: item.department || "",
      location: item.location || "",
      employment_type: item.employment_type || "",
      experience_level: item.experience_level || "",
      application_deadline: item.application_deadline || "",
      short_summary: item.short_summary || "",
      full_description: item.full_description || "",
      requirements: item.requirements.join("\n"),
      application_email: item.application_email || "",
      external_application_url: item.external_application_url || "",
      status: item.status,
      hiring_status: item.hiring_status,
      featured: Boolean(item.featured),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteCareer(id);
      toast({ title: "Vacancy deleted" });
      if (items.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        fetchItems();
      }
    } catch (error) {
      toast({
        title: "Could not delete vacancy",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const statusTone = (status: string) => (status === "published" ? "success" : "neutral") as const;
  const hiringTone = (status: string) => (status === "open" ? "info" : "warning") as const;

  return (
    <AdminPage
      title="Careers"
      description="Manage the public careers landing page content through settings and keep open school vacancies up to date from one place."
      eyebrow="Talent"
      action={(
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="rounded-xl shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              New Vacancy
            </Button>
          </DialogTrigger>
          <DialogContent className={`${adminDialogContentClassName} max-w-4xl`}>
            <DialogHeader className="border-b border-border/70 px-6 py-5 sm:px-7">
              <DialogTitle>{editing ? "Edit vacancy" : "Add vacancy"}</DialogTitle>
            </DialogHeader>
            <div className={adminFormClassName}>
              <AdminFormSection title="Role basics" description="Define the main job title, URL slug, and operational details shown on the careers pages.">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AdminField label="Title"><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></AdminField>
                  <AdminField label="Slug" hint="Leave blank to auto-generate from the title."><Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="auto-generated" /></AdminField>
                  <AdminField label="Department"><Input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} /></AdminField>
                  <AdminField label="Location"><Input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></AdminField>
                  <AdminField label="Employment Type"><Input value={form.employment_type} onChange={(event) => setForm({ ...form, employment_type: event.target.value })} placeholder="Full-time, Part-time..." /></AdminField>
                  <AdminField label="Experience Level"><Input value={form.experience_level} onChange={(event) => setForm({ ...form, experience_level: event.target.value })} placeholder="Entry, Mid-level..." /></AdminField>
                  <AdminField label="Application Deadline"><Input type="date" value={form.application_deadline} onChange={(event) => setForm({ ...form, application_deadline: event.target.value })} /></AdminField>
                  <AdminField label="Publishing Status">
                    <select className={adminSelectClassName} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </AdminField>
                  <AdminField label="Hiring Status">
                    <select className={adminSelectClassName} value={form.hiring_status} onChange={(event) => setForm({ ...form, hiring_status: event.target.value })}>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </AdminField>
                </div>
              </AdminFormSection>

              <AdminFormSection title="Public job content" description="Write a clear role summary, the full description, and the key requirements for interested candidates.">
                <div className="grid gap-4">
                  <AdminField label="Short Summary">
                    <Textarea value={form.short_summary} onChange={(event) => setForm({ ...form, short_summary: event.target.value })} rows={3} />
                  </AdminField>
                  <AdminField label="Full Description">
                    <Textarea value={form.full_description} onChange={(event) => setForm({ ...form, full_description: event.target.value })} rows={8} />
                  </AdminField>
                  <AdminField label="Requirements" hint="Use one requirement per line.">
                    <Textarea value={form.requirements} onChange={(event) => setForm({ ...form, requirements: event.target.value })} rows={6} />
                  </AdminField>
                </div>
              </AdminFormSection>

              <AdminFormSection title="Application options" description="Choose how candidates should apply for this role. You can use an email address, an external application URL, or both.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Application Email"><Input value={form.application_email} onChange={(event) => setForm({ ...form, application_email: event.target.value })} type="email" /></AdminField>
                  <AdminField label="External Application URL"><Input value={form.external_application_url} onChange={(event) => setForm({ ...form, external_application_url: event.target.value })} placeholder="https://..." /></AdminField>
                </div>
                <div className="mt-4">
                  <AdminBooleanRow
                    label="Feature this vacancy"
                    description="Featured roles appear first on the public careers page."
                    checked={form.featured}
                    onChange={(checked) => setForm({ ...form, featured: checked })}
                  />
                </div>
              </AdminFormSection>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="rounded-xl px-6 shadow-sm">Save Vacancy</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    >
      <AdminSurface>
        <AdminPanelHeader
          title="Vacancy manager"
          description={`${pagination.total} career vacanc${pagination.total === 1 ? "y" : "ies"} currently stored in the CMS.`}
          action={(
            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
              <div className="relative w-full lg:w-80">
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
                  placeholder="Search vacancies..."
                />
              </div>
              <select className={adminSelectClassName} value={statusFilter} onChange={(event) => { setPage(1); setStatusFilter(event.target.value); }}>
                <option value="">All publish states</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <select className={adminSelectClassName} value={hiringStatusFilter} onChange={(event) => { setPage(1); setHiringStatusFilter(event.target.value); }}>
                <option value="">All hiring states</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}
        />

        {loading ? (
          <AdminEmptyState icon={BriefcaseBusiness} title="Loading vacancies..." description="Fetching the latest careers content from the CMS." />
        ) : items.length === 0 ? (
          <AdminEmptyState
            icon={BriefcaseBusiness}
            title={query || statusFilter || hiringStatusFilter ? "No vacancies matched the current filters" : "No vacancies yet"}
            description={query || statusFilter || hiringStatusFilter
              ? "Try another keyword or clear one of the filters to view more roles."
              : "Add your first vacancy here, then update the Careers page messaging from Settings."
            }
          />
        ) : (
          <>
            <div className="grid gap-3 p-4 md:hidden">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.slug}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <AdminStatusBadge tone={statusTone(item.status)}>{item.status}</AdminStatusBadge>
                    <AdminStatusBadge tone={hiringTone(item.hiring_status)}>{item.hiring_status}</AdminStatusBadge>
                    {item.featured ? <AdminStatusBadge tone="warning">featured</AdminStatusBadge> : null}
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Department:</span> {item.department || "-"}</p>
                    <p><span className="font-medium text-foreground">Type:</span> {item.employment_type || "-"}</p>
                    <p><span className="font-medium text-foreground">Deadline:</span> {item.application_deadline || "-"}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => handleEdit(item)}>Edit</Button>
                    <AdminDeleteButton
                      label="Delete vacancy?"
                      description={`This will permanently remove ${item.title} from the careers module.`}
                      onConfirm={() => handleDelete(item.id)}
                      trigger={<Button variant="outline" className="flex-1 rounded-xl text-destructive">Delete</Button>}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vacancy</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Employment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hiring</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.department || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{item.employment_type || "-"}</TableCell>
                      <TableCell><AdminStatusBadge tone={statusTone(item.status)}>{item.status}</AdminStatusBadge></TableCell>
                      <TableCell><AdminStatusBadge tone={hiringTone(item.hiring_status)}>{item.hiring_status}</AdminStatusBadge></TableCell>
                      <TableCell className="text-muted-foreground">{item.application_deadline || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className={adminIconButtonClassName} onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AdminDeleteButton
                            label="Delete vacancy?"
                            description={`This will permanently remove ${item.title} from the careers module.`}
                            onConfirm={() => handleDelete(item.id)}
                            trigger={(
                              <Button variant="ghost" size="icon" className={adminIconButtonClassName}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          />
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
          page={pagination.page}
          pageCount={pagination.page_count}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(pagination.page_count, current + 1))}
        />
      </AdminSurface>
    </AdminPage>
  );
};

export default AdminCareers;
