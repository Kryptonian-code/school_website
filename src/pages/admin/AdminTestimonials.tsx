import { useCallback, useEffect, useState } from "react";
import { MessageSquareQuote, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import MediaUploadField from "@/components/admin/MediaUploadField";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { PaginationMeta, Testimonial } from "@/types/content";
import { AdminBooleanRow, AdminDeleteButton, AdminEmptyState, AdminField, AdminPage, AdminPanelHeader, AdminSurface, AdminTablePagination, adminDialogContentClassName, adminFormClassName, adminIconButtonClassName } from "@/components/admin/AdminUI";

const emptyForm = {
  name: "",
  role: "",
  message: "",
  rating: 5,
  photo_url: "",
  is_published: true,
  display_order: 0,
};
const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, page_count: 1 };

const AdminTestimonials = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getTestimonials({ page, limit: 10, search: query });
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
      await api.saveTestimonial(form, editing?.id);
      toast({ title: editing ? "Testimonial updated" : "Testimonial created" });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setPage(1);
      fetchItems();
    } catch (error) {
      toast({ title: "Could not save testimonial", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    }
  };

  const handleEdit = (item: Testimonial) => {
    setEditing(item);
    setForm({
      name: item.name,
      role: item.role || "",
      message: item.message,
      rating: item.rating,
      photo_url: item.photo_url || "",
      is_published: Boolean(item.is_published),
      display_order: item.display_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteTestimonial(id);
      toast({ title: "Testimonial deleted" });
      if (items.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        fetchItems();
      }
    } catch (error) {
      toast({ title: "Could not delete testimonial", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    }
  };

  return (
    <AdminPage
      title="Testimonials"
      description="Curate the social proof and community feedback displayed across the public school website."
      action={(
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(emptyForm); }} className="rounded-xl shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className={`${adminDialogContentClassName} max-w-2xl`}>
            <DialogHeader className="border-b border-border/70 px-6 py-5 sm:px-7">
              <DialogTitle>{editing ? "Edit testimonial" : "Add testimonial"}</DialogTitle>
            </DialogHeader>
            <div className={adminFormClassName}>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Name"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></AdminField>
                <AdminField label="Role"><Input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} /></AdminField>
                <AdminField label="Rating"><Input type="number" min={1} max={5} value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} /></AdminField>
                <AdminField label="Display Order"><Input type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: Number(event.target.value) })} /></AdminField>
              </div>
              <MediaUploadField
                label="Photo"
                value={form.photo_url}
                onChange={(value) => setForm({ ...form, photo_url: value })}
                folder="testimonials"
                helperText="Upload a photo or paste an image URL."
              />
              <AdminField label="Message"><Textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} rows={6} /></AdminField>
              <AdminBooleanRow
                label="Publish on public site"
                description="Keep this enabled to show the testimonial on the public-facing website."
                checked={form.is_published}
                onChange={(checked) => setForm({ ...form, is_published: checked })}
              />
              <div className="flex justify-end">
                <Button onClick={handleSave} className="rounded-xl px-6 shadow-sm">Save Testimonial</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      eyebrow="Community trust"
    >
      <AdminSurface>
        <AdminPanelHeader
          title="Testimonial list"
          description={`${pagination.total} testimonial${pagination.total === 1 ? "" : "s"} currently managed in the CMS.`}
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
                placeholder="Search testimonials..."
              />
            </div>
          )}
        />
        {loading ? (
          <AdminEmptyState icon={MessageSquareQuote} title="Loading testimonials..." description="Fetching the latest review content." />
        ) : (
        <div className="grid gap-3 p-4 md:hidden">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
              <p className="font-semibold text-foreground">{item.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.role || "Community member"} • {item.rating}/5</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => handleEdit(item)}>Edit</Button>
                <AdminDeleteButton label="Delete testimonial?" description={`This will permanently remove the testimonial from ${item.name}.`} onConfirm={() => handleDelete(item.id)} trigger={<Button variant="outline" className="flex-1 rounded-xl text-destructive">Delete</Button>} />
              </div>
            </div>
          ))}
        </div>
        )}
        <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <AdminEmptyState
                    icon={MessageSquareQuote}
                    title="No testimonials yet"
                    description="Add strong parent or student feedback here to support trust and credibility on the website."
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.role || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{item.rating}/5</TableCell>
                  <TableCell className="text-muted-foreground">{item.display_order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className={adminIconButtonClassName} onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <AdminDeleteButton label="Delete testimonial?" description={`This will permanently remove the testimonial from ${item.name}.`} onConfirm={() => handleDelete(item.id)} trigger={<Button variant="ghost" size="icon" className={adminIconButtonClassName}><Trash2 className="h-4 w-4 text-destructive" /></Button>} />
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

export default AdminTestimonials;
