import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import MediaUploadField from "@/components/admin/MediaUploadField";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost, PaginationMeta } from "@/types/content";
import { AdminDeleteButton, AdminEmptyState, AdminExportButton, AdminField, AdminFormSection, AdminPage, AdminPanelHeader, AdminStatusBadge, AdminSurface, AdminTablePagination, adminDialogContentClassName, adminFormClassName, adminIconButtonClassName, adminSelectClassName } from "@/components/admin/AdminUI";

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  status: "draft",
  featured_image_url: "",
  meta_title: "",
  meta_description: "",
};

const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, page_count: 1 };

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getBlogPosts({ page, limit: 10, search: query });
      setPosts(response.items);
      setPagination(response.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchPosts().catch(() => undefined);
  }, [fetchPosts]);

  const handleSave = async () => {
    try {
      await api.saveBlogPost(
        {
          ...form,
          slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-"),
        },
        editing?.id,
      );

      toast({ title: editing ? "Post updated" : "Post created" });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setPage(1);
      fetchPosts();
    } catch (error) {
      toast({
        title: "Could not save post",
        description: error instanceof Error ? error.message : "Please review the form and try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      category: post.category || "",
      status: post.status,
      featured_image_url: post.featured_image_url || "",
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteBlogPost(id);
      toast({ title: "Post deleted" });
      if (posts.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        fetchPosts();
      }
    } catch (error) {
      toast({
        title: "Could not delete post",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminPage
      title="Blog Posts"
      description="Manage the school news, announcements, and updates surfaced on the public website."
      action={(
        <>
          <AdminExportButton entity="blog-posts" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); setForm(emptyForm); }} className="rounded-xl shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className={`${adminDialogContentClassName} max-w-3xl`}>
              <DialogHeader className="border-b border-border/70 px-6 py-5 sm:px-7">
                <DialogTitle>{editing ? "Edit post" : "Create post"}</DialogTitle>
              </DialogHeader>
              <div className={adminFormClassName}>
                <AdminFormSection title="Post basics" description="Define the title, slug, category, and publish state.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AdminField label="Title"><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></AdminField>
                    <AdminField label="Slug"><Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></AdminField>
                    <AdminField label="Category"><Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></AdminField>
                    <AdminField label="Status">
                      <select className={adminSelectClassName} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </AdminField>
                  </div>
                </AdminFormSection>

                <AdminFormSection title="Content" description="Write the summary, full article, and supporting cover media.">
                  <div className="grid gap-4">
                    <MediaUploadField
                      label="Featured Image"
                      value={form.featured_image_url}
                      onChange={(value) => setForm({ ...form, featured_image_url: value })}
                      folder="blog"
                      helperText="Upload a featured image from your computer."
                    />
                    <AdminField label="Excerpt">
                      <Textarea value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} rows={3} />
                    </AdminField>
                    <AdminField label="Content">
                      <Textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} rows={10} />
                    </AdminField>
                  </div>
                </AdminFormSection>

                <AdminFormSection title="Search optimisation" description="Optional SEO fields for richer search previews.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AdminField label="SEO Title"><Input value={form.meta_title} onChange={(event) => setForm({ ...form, meta_title: event.target.value })} /></AdminField>
                    <AdminField label="SEO Description"><Input value={form.meta_description} onChange={(event) => setForm({ ...form, meta_description: event.target.value })} /></AdminField>
                  </div>
                </AdminFormSection>

                <div className="flex justify-end">
                  <Button onClick={handleSave} className="rounded-xl px-6 shadow-sm">Save Post</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
      eyebrow="Newsroom"
    >
      <AdminSurface>
        <AdminPanelHeader
          title="Post library"
          description={`${pagination.total} post${pagination.total === 1 ? "" : "s"} currently available in the CMS.`}
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
                placeholder="Search posts..."
              />
            </div>
          )}
        />
        {loading ? (
          <AdminEmptyState title="Loading posts..." description="Fetching the latest news and announcement content." />
        ) : posts.length === 0 ? (
          <AdminEmptyState
            title={query ? "No posts match your search" : "No posts yet"}
            description={query ? "Try another keyword to find the story you need." : "Create a post to populate the school news section on the public website."}
          />
        ) : (
          <>
            <div className="grid gap-3 p-4 md:hidden">
              {posts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{post.slug}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <AdminStatusBadge tone={post.status === "published" ? "success" : "neutral"}>{post.status}</AdminStatusBadge>
                    <span className="text-xs text-muted-foreground">{format(new Date(post.published_at || post.created_at), "dd MMM yyyy")}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{post.category || "No category"}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => handleEdit(post)}>Edit</Button>
                    <AdminDeleteButton
                      label="Delete blog post?"
                      description={`This will permanently remove ${post.title} from the website.`}
                      onConfirm={() => handleDelete(post.id)}
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
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{post.title}</div>
                          <div className="text-xs text-muted-foreground">{post.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{post.category || "-"}</TableCell>
                      <TableCell>
                        <AdminStatusBadge tone={post.status === "published" ? "success" : "neutral"}>{post.status}</AdminStatusBadge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(post.published_at || post.created_at), "dd MMM yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className={adminIconButtonClassName} onClick={() => handleEdit(post)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AdminDeleteButton
                            label="Delete blog post?"
                            description={`This will permanently remove ${post.title} from the website.`}
                            onConfirm={() => handleDelete(post.id)}
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

export default AdminBlog;
