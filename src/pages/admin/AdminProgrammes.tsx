import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import MediaUploadField from "@/components/admin/MediaUploadField";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { PaginationMeta, Programme } from "@/types/content";
import { programmeThemeOptions } from "@/lib/programmeThemes";
import { AdminDeleteButton, AdminEmptyState, AdminExportButton, AdminField, AdminFormSection, AdminPage, AdminPanelHeader, AdminSurface, AdminTablePagination, adminDialogContentClassName, adminFormClassName, adminIconButtonClassName, adminSelectClassName } from "@/components/admin/AdminUI";

const emptyForm = {
  title: "",
  slug: "",
  age_group: "",
  duration: "",
  short_description: "",
  full_description: "",
  highlights: "",
  subjects: "",
  theme_color: "bg-blue-50 border-blue-200",
  brochure_url: "",
  image_url: "",
  sort_order: 0,
};

const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, page_count: 1 };

const AdminProgrammes = () => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Programme | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchProgrammes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getProgrammes({ page, limit: 10, search: query });
      setProgrammes(response.items);
      setPagination(response.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchProgrammes().catch(() => undefined);
  }, [fetchProgrammes]);

  const handleSave = async () => {
    const payload = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-"),
    };
    try {
      await api.saveProgramme(payload, editing?.id);
      toast({ title: editing ? "Programme updated" : "Programme created" });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setPage(1);
      fetchProgrammes();
    } catch (error) {
      toast({
        title: "Could not save programme",
        description: error instanceof Error ? error.message : "Please review the form and try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (programme: Programme) => {
    setEditing(programme);
    setForm({
      title: programme.title,
      slug: programme.slug,
      age_group: programme.age_group || "",
      duration: programme.duration || "",
      short_description: programme.short_description || "",
      full_description: programme.full_description || "",
      highlights: programme.highlights.join("\n"),
      subjects: programme.subjects.join("\n"),
      theme_color: programme.theme_color,
      brochure_url: programme.brochure_url || "",
      image_url: programme.image_url || "",
      sort_order: programme.sort_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteProgramme(id);
      toast({ title: "Programme deleted" });
      if (programmes.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        fetchProgrammes();
      }
    } catch (error) {
      toast({
        title: "Could not delete programme",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminPage
      title="Programmes"
      description="Shape the academic offering displayed across the website, from card previews on the homepage to full detail pages."
      action={(
        <>
          <AdminExportButton entity="programmes" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); setForm(emptyForm); }} className="rounded-xl shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Programme
              </Button>
            </DialogTrigger>
            <DialogContent className={`${adminDialogContentClassName} max-w-4xl`}>
              <DialogHeader className="border-b border-border/70 px-6 py-5 sm:px-7">
                <DialogTitle>{editing ? "Edit programme" : "Add programme"}</DialogTitle>
              </DialogHeader>
              <div className={adminFormClassName}>
                <AdminFormSection
                  title="Core information"
                  description="Set the programme name, slug, age group, duration, and ordering."
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <AdminField label="Title"><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></AdminField>
                    <AdminField label="Slug" hint="Leave blank to auto-generate from the title."><Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="auto-generated" /></AdminField>
                    <AdminField label="Sort Order"><Input type="number" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} /></AdminField>
                    <AdminField label="Age Group"><Input value={form.age_group} onChange={(event) => setForm({ ...form, age_group: event.target.value })} /></AdminField>
                    <AdminField label="Duration"><Input value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} /></AdminField>
                    <AdminField label="Card Theme">
                      <select className={adminSelectClassName} value={form.theme_color} onChange={(event) => setForm({ ...form, theme_color: event.target.value })}>
                        {programmeThemeOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </AdminField>
                  </div>
                </AdminFormSection>

                <AdminFormSection
                  title="Programme content"
                  description="Write the public-facing summaries, detailed overview, and list content."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AdminField label="Short Description" className="sm:col-span-2">
                      <Textarea value={form.short_description} onChange={(event) => setForm({ ...form, short_description: event.target.value })} rows={3} />
                    </AdminField>
                    <AdminField label="Full Description" className="sm:col-span-2">
                      <Textarea value={form.full_description} onChange={(event) => setForm({ ...form, full_description: event.target.value })} rows={6} />
                    </AdminField>
                    <AdminField label="Highlights" hint="Use one item per line.">
                      <Textarea value={form.highlights} onChange={(event) => setForm({ ...form, highlights: event.target.value })} rows={6} />
                    </AdminField>
                    <AdminField label="Subjects" hint="Use one item per line.">
                      <Textarea value={form.subjects} onChange={(event) => setForm({ ...form, subjects: event.target.value })} rows={6} />
                    </AdminField>
                  </div>
                </AdminFormSection>

                <AdminFormSection
                  title="Media and downloads"
                  description="Attach a representative image and optional brochure file."
                >
                  <div className="space-y-5">
                    <MediaUploadField
                      label="Programme Image"
                      value={form.image_url}
                      onChange={(value) => setForm({ ...form, image_url: value })}
                      folder="programmes"
                      helperText="Upload a programme image from your computer."
                    />
                    <MediaUploadField
                      label="Brochure File"
                      value={form.brochure_url}
                      onChange={(value) => setForm({ ...form, brochure_url: value })}
                      folder="brochures"
                      accept=".pdf,.doc,.docx"
                      helperText="Upload a brochure file or enter an existing downloadable file URL."
                      allowManualEntry
                    />
                  </div>
                </AdminFormSection>

                <div className="flex justify-end">
                  <Button onClick={handleSave} className="rounded-xl px-6 shadow-sm">Save Programme</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
      eyebrow="Curriculum"
    >
      <AdminSurface>
        <AdminPanelHeader
          title="Programme library"
          description={`${pagination.total} programme${pagination.total === 1 ? "" : "s"} currently configured for the site.`}
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
                placeholder="Search programmes..."
              />
            </div>
          )}
        />
        {loading ? (
          <AdminEmptyState title="Loading programmes..." description="Fetching the latest programme list." />
        ) : programmes.length === 0 ? (
          <AdminEmptyState
            title={query ? "No programmes match your search" : "No programmes yet"}
            description={query ? "Try another search term to find the programme you need." : "Programmes added here will populate the academic sections of the public site."}
          />
        ) : (
          <>
            <div className="grid gap-3 p-4 md:hidden">
              {programmes.map((programme) => (
                <div key={programme.id} className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{programme.title}</p>
                    <p className="text-xs text-muted-foreground">{programme.slug}</p>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Age group:</span> {programme.age_group || "-"}</p>
                    <p><span className="font-medium text-foreground">Duration:</span> {programme.duration || "-"}</p>
                    <p><span className="font-medium text-foreground">Sort order:</span> {programme.sort_order}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => handleEdit(programme)}>Edit</Button>
                    <AdminDeleteButton
                      label="Delete programme?"
                      description={`This will permanently remove ${programme.title} from the CMS and public site.`}
                      onConfirm={() => handleDelete(programme.id)}
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
                    <TableHead>Title</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Sort</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programmes.map((programme) => (
                    <TableRow key={programme.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{programme.title}</div>
                          <div className="text-xs text-muted-foreground">{programme.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{programme.age_group || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{programme.duration || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{programme.sort_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className={adminIconButtonClassName} onClick={() => handleEdit(programme)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AdminDeleteButton
                            label="Delete programme?"
                            description={`This will permanently remove ${programme.title} from the CMS and public site.`}
                            onConfirm={() => handleDelete(programme.id)}
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

export default AdminProgrammes;
