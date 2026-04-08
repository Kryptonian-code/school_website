import { useCallback, useEffect, useState } from "react";
import { Building2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import MediaUploadField from "@/components/admin/MediaUploadField";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Facility, PaginationMeta } from "@/types/content";
import { AdminDeleteButton, AdminEmptyState, AdminField, AdminPage, AdminPanelHeader, AdminSurface, AdminTablePagination, adminDialogContentClassName, adminFormClassName, adminIconButtonClassName } from "@/components/admin/AdminUI";

const emptyForm = {
  title: "",
  slug: "",
  short_description: "",
  image_url: "",
  display_order: 0,
};
const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, page_count: 1 };

const AdminFacilities = () => {
  const [items, setItems] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Facility | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getFacilities({ page, limit: 10, search: query });
      setItems(response.items);
      setPagination(response.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchItems().catch(() => undefined);
  }, [fetchItems]);

  const handleSave = async () => {
    try {
      await api.saveFacility(
        { ...form, slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-") },
        editing?.id,
      );
      toast({ title: editing ? "Facility updated" : "Facility created" });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setPage(1);
      fetchItems();
    } catch (error) {
      toast({ title: "Could not save facility", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    }
  };

  const handleEdit = (item: Facility) => {
    setEditing(item);
    setForm({
      title: item.title,
      slug: item.slug,
      short_description: item.short_description || "",
      image_url: item.image_url || "",
      display_order: item.display_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteFacility(id);
      toast({ title: "Facility deleted" });
      if (items.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        fetchItems();
      }
    } catch (error) {
      toast({ title: "Could not delete facility", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    }
  };

  return (
    <AdminPage
      title="Facilities"
      description="Manage the campus facilities highlighted on the public site so parents can quickly understand the school environment."
      action={(
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(emptyForm); }} className="rounded-xl shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Facility
            </Button>
          </DialogTrigger>
          <DialogContent className={`${adminDialogContentClassName} max-w-2xl`}>
            <DialogHeader className="border-b border-border/70 px-6 py-5 sm:px-7">
              <DialogTitle>{editing ? "Edit facility" : "Add facility"}</DialogTitle>
            </DialogHeader>
            <div className={adminFormClassName}>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Title"><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></AdminField>
                <AdminField label="Slug"><Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></AdminField>
                <AdminField label="Display Order"><Input type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: Number(event.target.value) })} /></AdminField>
              </div>
              <MediaUploadField
                label="Facility Image"
                value={form.image_url}
                onChange={(value) => setForm({ ...form, image_url: value })}
                folder="facilities"
                helperText="Upload a facility image from your computer."
              />
              <AdminField label="Description"><Textarea value={form.short_description} onChange={(event) => setForm({ ...form, short_description: event.target.value })} rows={5} /></AdminField>
              <div className="flex justify-end">
                <Button onClick={handleSave} className="rounded-xl px-6 shadow-sm">Save Facility</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      eyebrow="Campus highlights"
    >
      <AdminSurface>
        <AdminPanelHeader
          title="Facility list"
          description={`${pagination.total} facility item${pagination.total === 1 ? "" : "s"} currently configured.`}
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
                placeholder="Search facilities..."
              />
            </div>
          )}
        />
        {loading ? (
          <AdminEmptyState icon={Building2} title="Loading facilities..." description="Fetching the latest campus facilities." />
        ) : (
        <div className="grid gap-3 p-4 md:hidden">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.short_description || "No description yet."}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => handleEdit(item)}>Edit</Button>
                <AdminDeleteButton label="Delete facility?" description={`This will permanently remove ${item.title}.`} onConfirm={() => handleDelete(item.id)} trigger={<Button variant="outline" className="flex-1 rounded-xl text-destructive">Delete</Button>} />
              </div>
            </div>
          ))}
        </div>
        )}
        <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <AdminEmptyState
                    icon={Building2}
                    title="No facilities yet"
                    description="Add campus spaces here to enrich the facilities section on the public website."
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">{item.title}</TableCell>
                  <TableCell className="max-w-md text-muted-foreground">{item.short_description || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{item.display_order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className={adminIconButtonClassName} onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <AdminDeleteButton label="Delete facility?" description={`This will permanently remove ${item.title}.`} onConfirm={() => handleDelete(item.id)} trigger={<Button variant="ghost" size="icon" className={adminIconButtonClassName}><Trash2 className="h-4 w-4 text-destructive" /></Button>} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
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

export default AdminFacilities;
