import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import MediaUploadField from "@/components/admin/MediaUploadField";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { PaginationMeta, StaffMember } from "@/types/content";
import { AdminBooleanRow, AdminDeleteButton, AdminEmptyState, AdminExportButton, AdminField, AdminFormSection, AdminPage, AdminPanelHeader, AdminSurface, AdminTablePagination, adminDialogContentClassName, adminFormClassName, adminIconButtonClassName } from "@/components/admin/AdminUI";

const emptyForm = {
  name: "",
  slug: "",
  position: "",
  department: "",
  qualification: "",
  email: "",
  phone: "",
  photo_url: "",
  bio: "",
  featured: true,
  sort_order: 0,
};

const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, page_count: 1 };

const AdminStaff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getStaff({ page, limit: 10, search: query });
      setStaff(response.items);
      setPagination(response.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchStaff().catch(() => undefined);
  }, [fetchStaff]);

  const handleSave = async () => {
    try {
      await api.saveStaff(
        {
          ...form,
          slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
        },
        editing?.id,
      );
      toast({ title: editing ? "Staff updated" : "Staff added" });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setPage(1);
      fetchStaff();
    } catch (error) {
      toast({
        title: "Could not save staff profile",
        description: error instanceof Error ? error.message : "Please review the form and try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (member: StaffMember) => {
    setEditing(member);
    setForm({
      name: member.name,
      slug: member.slug,
      position: member.position || "",
      department: member.department || "",
      qualification: member.qualification || "",
      email: member.email || "",
      phone: member.phone || "",
      photo_url: member.photo_url || "",
      bio: member.bio || "",
      featured: Boolean(member.featured),
      sort_order: member.sort_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteStaff(id);
      toast({ title: "Staff removed" });
      if (staff.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        fetchStaff();
      }
    } catch (error) {
      toast({
        title: "Could not delete staff profile",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminPage
      title="Staff Directory"
      description="Manage the team profiles that appear throughout the school website, including homepage features and full directory pages."
      action={(
        <>
          <AdminExportButton entity="staff" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); setForm(emptyForm); }} className="rounded-xl shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className={`${adminDialogContentClassName} max-w-3xl`}>
            <DialogHeader className="border-b border-border/70 px-6 py-5 sm:px-7">
              <DialogTitle>{editing ? "Edit staff member" : "Add staff member"}</DialogTitle>
            </DialogHeader>
            <div className={adminFormClassName}>
              <AdminFormSection title="Profile basics" description="Set the name, slug, academic role, and sort order.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Name"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></AdminField>
                  <AdminField label="Slug"><Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></AdminField>
                  <AdminField label="Position"><Input value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} /></AdminField>
                  <AdminField label="Department"><Input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} /></AdminField>
                  <AdminField label="Qualification"><Input value={form.qualification} onChange={(event) => setForm({ ...form, qualification: event.target.value })} /></AdminField>
                  <AdminField label="Sort Order"><Input type="number" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} /></AdminField>
                </div>
              </AdminFormSection>
              <AdminFormSection title="Contact and media" description="Add optional contact details and a staff portrait.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Email"><Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></AdminField>
                  <AdminField label="Phone"><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></AdminField>
                </div>
                <div className="mt-4">
                  <MediaUploadField
                    label="Photo"
                    value={form.photo_url}
                    onChange={(value) => setForm({ ...form, photo_url: value })}
                    folder="staff"
                    helperText="Upload a staff portrait or paste an existing image URL."
                  />
                </div>
              </AdminFormSection>
              <AdminFormSection title="Biography" description="Provide the short narrative shown on profile cards and staff pages.">
                <AdminField label="Bio">
                  <Textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} rows={5} />
                </AdminField>
                <div className="mt-4">
                  <AdminBooleanRow
                    label="Feature on landing page"
                    description="When enabled, this profile can appear in highlighted homepage staff sections."
                    checked={form.featured}
                    onChange={(checked) => setForm({ ...form, featured: checked })}
                  />
                </div>
              </AdminFormSection>
              <div className="flex justify-end">
                <Button onClick={handleSave} className="rounded-xl px-6 shadow-sm">Save Staff Member</Button>
              </div>
            </div>
            </DialogContent>
          </Dialog>
        </>
      )}
      eyebrow="People"
    >
      <AdminSurface>
        <AdminPanelHeader
          title="Staff profiles"
          description={`${pagination.total} staff profile${pagination.total === 1 ? "" : "s"} currently stored in the CMS.`}
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
                placeholder="Search staff..."
              />
            </div>
          )}
        />
        {loading ? (
          <AdminEmptyState icon={Users} title="Loading staff..." description="Fetching the latest directory profiles." />
        ) : staff.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title={query ? "No staff profiles match your search" : "No staff profiles yet"}
            description={query ? "Try another search term to locate the team member you need." : "Add team members here to populate the homepage preview and the full staff page."}
          />
        ) : (
          <>
            <div className="grid gap-3 p-4 md:hidden">
              {staff.map((member) => (
                <div key={member.id} className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                  <p className="font-semibold text-foreground">{member.name}</p>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Position:</span> {member.position || "-"}</p>
                    <p><span className="font-medium text-foreground">Department:</span> {member.department || "-"}</p>
                    <p><span className="font-medium text-foreground">Featured:</span> {member.featured ? "Yes" : "No"}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => handleEdit(member)}>Edit</Button>
                    <AdminDeleteButton
                      label="Delete staff profile?"
                      description={`This will permanently remove ${member.name} from the staff directory.`}
                      onConfirm={() => handleDelete(member.id)}
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
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium text-foreground">{member.name}</TableCell>
                      <TableCell className="text-muted-foreground">{member.position || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{member.department || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className={adminIconButtonClassName} onClick={() => handleEdit(member)}><Pencil className="h-4 w-4" /></Button>
                          <AdminDeleteButton
                            label="Delete staff profile?"
                            description={`This will permanently remove ${member.name} from the staff directory.`}
                            onConfirm={() => handleDelete(member.id)}
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

export default AdminStaff;
