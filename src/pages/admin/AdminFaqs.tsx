import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { FaqItem } from "@/types/content";
import { AdminBooleanRow, AdminDeleteButton, AdminEmptyState, AdminField, AdminPage, AdminPanelHeader, AdminStatusBadge, AdminSurface, adminDialogContentClassName, adminFormClassName, adminIconButtonClassName } from "@/components/admin/AdminUI";

const emptyForm = {
  question: "",
  answer: "",
  sort_order: 0,
  is_published: true,
};

const AdminFaqs = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchFaqs = async () => {
    const response = await api.getFaqs();
    setFaqs(response.items);
  };

  useEffect(() => {
    fetchFaqs().catch(() => undefined);
  }, []);

  const handleSave = async () => {
    try {
      await api.saveFaq(form, editing?.id);
      toast({ title: editing ? "FAQ updated" : "FAQ created" });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      fetchFaqs();
    } catch (error) {
      toast({ title: "Could not save FAQ", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    }
  };

  const handleEdit = (faq: FaqItem) => {
    setEditing(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      sort_order: faq.sort_order,
      is_published: Boolean(faq.is_published),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteFaq(id);
      toast({ title: "FAQ deleted" });
      fetchFaqs();
    } catch (error) {
      toast({ title: "Could not delete FAQ", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    }
  };

  return (
    <AdminPage
      title="FAQs"
      description="Maintain the public question-and-answer section so families always have accurate guidance."
      action={(
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(emptyForm); }} className="rounded-xl shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className={`${adminDialogContentClassName} max-w-2xl`}>
            <DialogHeader className="border-b border-border/70 px-6 py-5 sm:px-7">
              <DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            </DialogHeader>
            <div className={adminFormClassName}>
              <AdminField label="Question"><Input value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} /></AdminField>
              <AdminField label="Answer"><Textarea value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} rows={6} /></AdminField>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Sort Order"><Input type="number" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} /></AdminField>
              </div>
              <AdminBooleanRow
                label="Publish this FAQ"
                description="When enabled, the question becomes visible on the public website."
                checked={form.is_published}
                onChange={(checked) => setForm({ ...form, is_published: checked })}
              />
              <div className="flex justify-end">
                <Button onClick={handleSave} className="rounded-xl px-6 shadow-sm">Save FAQ</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      eyebrow="Support content"
    >
      <AdminSurface>
        <AdminPanelHeader
          title="FAQ library"
          description={`${faqs.length} frequently asked question${faqs.length === 1 ? "" : "s"} currently stored.`}
        />
        <div className="grid gap-3 p-4 md:hidden">
          {faqs.map((faq) => (
            <div key={faq.id} className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
              <p className="font-semibold text-foreground">{faq.question}</p>
              <AdminStatusBadge tone={faq.is_published ? "success" : "neutral"}>{faq.is_published ? "Published" : "Hidden"}</AdminStatusBadge>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => handleEdit(faq)}>Edit</Button>
                <AdminDeleteButton label="Delete FAQ?" description="This will permanently remove the selected FAQ entry." onConfirm={() => handleDelete(faq.id)} trigger={<Button variant="outline" className="flex-1 rounded-xl text-destructive">Delete</Button>} />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <AdminEmptyState
                    title="No FAQs yet"
                    description="Create your first FAQ to start building a stronger self-service experience for families."
                  />
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="font-medium text-foreground">{faq.question}</TableCell>
                  <TableCell>
                    <AdminStatusBadge tone={faq.is_published ? "success" : "neutral"}>{faq.is_published ? "Published" : "Hidden"}</AdminStatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{faq.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className={adminIconButtonClassName} onClick={() => handleEdit(faq)}><Pencil className="h-4 w-4" /></Button>
                      <AdminDeleteButton label="Delete FAQ?" description="This will permanently remove the selected FAQ entry." onConfirm={() => handleDelete(faq.id)} trigger={<Button variant="ghost" size="icon" className={adminIconButtonClassName}><Trash2 className="h-4 w-4 text-destructive" /></Button>} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </AdminSurface>
    </AdminPage>
  );
};

export default AdminFaqs;
