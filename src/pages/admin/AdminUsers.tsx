import { useCallback, useEffect, useState } from "react";
import { KeyRound, Pencil, Plus, Search, Trash2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminUser, PaginationMeta } from "@/types/content";
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

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "admissions_manager", label: "Admissions Manager" },
  { value: "enquiries_manager", label: "Enquiries Manager" },
];

const emptyForm = {
  username: "",
  display_name: "",
  email: "",
  role: "editor",
  is_active: true,
  password: "",
};

const emptyPagination: PaginationMeta = { page: 1, limit: 10, total: 0, page_count: 1 };

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const [recoveryUser, setRecoveryUser] = useState<AdminUser | null>(null);
  const [generatedRecoveryKey, setGeneratedRecoveryKey] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [password, setPassword] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getUsers({ page, limit: 10, search: query });
      setUsers(response.items);
      setPagination(response.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchUsers().catch(() => undefined);
  }, [fetchUsers]);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    const payload: Record<string, unknown> = {
      username: form.username,
      display_name: form.display_name,
      email: form.email || null,
      role: form.role,
      is_active: form.is_active,
    };

    if (!editing) {
      payload.password = form.password;
    }

    try {
      await api.saveUser(payload, editing?.id);
      toast({ title: editing ? "User updated" : "User created" });
      setDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast({
        title: "Could not save user",
        description: error instanceof Error ? error.message : "Please review the form and try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (member: AdminUser) => {
    setEditing(member);
    setForm({
      username: member.username,
      display_name: member.display_name,
      email: member.email || "",
      role: member.role,
      is_active: Boolean(member.is_active ?? 1),
      password: "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteUser(id);
      toast({ title: "User deleted" });
      if (users.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Could not delete user",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (!passwordUser) return;

    try {
      await api.changeUserPassword(passwordUser.id, password);
      toast({ title: "Password updated" });
      setPasswordDialogOpen(false);
      setPassword("");
      setPasswordUser(null);
    } catch (error) {
      toast({
        title: "Could not update password",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateRecoveryKey = async () => {
    if (!recoveryUser) return;

    try {
      const response = await api.generateRecoveryKey(recoveryUser.id);
      setGeneratedRecoveryKey(response.recovery_key);
      toast({ title: "Recovery key generated", description: response.message });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Could not generate recovery key",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminPage
      title="Users"
      description="Manage admin accounts, assign roles, and control who can access the CMS."
      eyebrow="Access control"
      action={(
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="rounded-xl shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className={`${adminDialogContentClassName} max-w-2xl`}>
            <DialogHeader className="border-b border-border/70 px-6 py-5 sm:px-7">
              <DialogTitle>{editing ? "Edit admin user" : "Create admin user"}</DialogTitle>
            </DialogHeader>
            <div className={adminFormClassName}>
              <AdminFormSection title="Account details" description="Set the login name, display name, role, and account state.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Username">
                    <Input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
                  </AdminField>
                  <AdminField label="Display Name">
                    <Input value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} />
                  </AdminField>
                  <AdminField label="Recovery Email">
                    <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                  </AdminField>
                  <AdminField label="Role">
                    <select className={adminSelectClassName} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </AdminField>
                  {!editing ? (
                    <AdminField label="Temporary Password">
                      <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                    </AdminField>
                  ) : null}
                </div>
                <div className="mt-4">
                  <AdminBooleanRow
                    label="Account active"
                    description="Inactive users cannot sign into the admin dashboard."
                    checked={form.is_active}
                    onChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                </div>
              </AdminFormSection>
              <div className="flex justify-end">
                <Button onClick={handleSave} className="rounded-xl px-6 shadow-sm">
                  {editing ? "Save User" : "Create User"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    >
      <AdminSurface>
        <AdminPanelHeader
          title="Admin accounts"
          description={`${pagination.total} user${pagination.total === 1 ? "" : "s"} found.`}
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
                  placeholder="Search usernames or roles..."
                />
              </div>
              <Button variant="outline" className="rounded-xl" onClick={() => { setPage(1); setQuery(searchInput.trim()); }}>
                Search
              </Button>
            </div>
          )}
        />

        {loading ? (
          <AdminEmptyState title="Loading users..." description="Fetching the latest admin account information." icon={UserCog} />
        ) : users.length === 0 ? (
          <AdminEmptyState
            title={query ? "No users match your search" : "No admin users yet"}
            description={query ? "Try another search term to find the account you need." : "Create the first additional admin or editor account from here."}
            icon={UserCog}
          />
        ) : (
          <>
            <div className="grid gap-3 p-4 md:hidden">
              {users.map((member) => {
                const isCurrent = currentUser?.id === member.id;
                return (
                  <div key={member.id} className="rounded-2xl border border-border/70 bg-card/88 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{member.display_name}</p>
                        <p className="text-xs text-muted-foreground">@{member.username}</p>
                      </div>
                      <AdminStatusBadge tone={(member.is_active ?? 1) ? "success" : "danger"}>
                        {(member.is_active ?? 1) ? "Active" : "Inactive"}
                      </AdminStatusBadge>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                      <p><span className="font-medium text-foreground">Role:</span> {member.role.replace("_", " ")}</p>
                      <p><span className="font-medium text-foreground">Recovery email:</span> {member.email || "Not set"}</p>
                      <p><span className="font-medium text-foreground">Recovery key:</span> {member.recovery_key_created_at ? `Ready since ${new Date(member.recovery_key_created_at).toLocaleDateString()}` : "Not generated"}</p>
                      <p><span className="font-medium text-foreground">Created:</span> {member.created_at ? new Date(member.created_at).toLocaleDateString() : "-"}</p>
                      {isCurrent ? <p className="text-xs font-medium text-primary">This is your current account.</p> : null}
                    </div>
                    <div className="mt-4 grid gap-2">
                      <Button variant="outline" className="rounded-xl" onClick={() => handleEdit(member)}>Edit</Button>
                      <Button variant="outline" className="rounded-xl" onClick={() => { setPasswordUser(member); setPasswordDialogOpen(true); }}>
                        Change Password
                      </Button>
                      <Button variant="outline" className="rounded-xl" onClick={() => { setRecoveryUser(member); setGeneratedRecoveryKey(""); setRecoveryDialogOpen(true); }}>
                        Recovery Key
                      </Button>
                      <AdminDeleteButton
                        label="Delete user?"
                        description={`This will permanently remove ${member.display_name} from the CMS.`}
                        onConfirm={() => handleDelete(member.id)}
                        trigger={<Button variant="outline" className="rounded-xl text-destructive" disabled={isCurrent}>Delete</Button>}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recovery</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((member) => {
                    const isCurrent = currentUser?.id === member.id;
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">{member.display_name}</div>
                            <div className="text-xs text-muted-foreground">@{member.username}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{member.role.replace("_", " ")}</TableCell>
                        <TableCell>
                          <AdminStatusBadge tone={(member.is_active ?? 1) ? "success" : "danger"}>
                            {(member.is_active ?? 1) ? "Active" : "Inactive"}
                          </AdminStatusBadge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{member.recovery_key_created_at ? "Ready" : "Missing"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{member.updated_at ? new Date(member.updated_at).toLocaleDateString() : "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className={adminIconButtonClassName} onClick={() => handleEdit(member)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className={adminIconButtonClassName} onClick={() => { setPasswordUser(member); setPasswordDialogOpen(true); }}>
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className={adminIconButtonClassName} onClick={() => { setRecoveryUser(member); setGeneratedRecoveryKey(""); setRecoveryDialogOpen(true); }}>
                              <UserCog className="h-4 w-4" />
                            </Button>
                            <AdminDeleteButton
                              label="Delete user?"
                              description={`This will permanently remove ${member.display_name} from the CMS.`}
                              onConfirm={() => handleDelete(member.id)}
                              trigger={(
                                <Button variant="ghost" size="icon" className={adminIconButtonClassName} disabled={isCurrent}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

      <Dialog open={passwordDialogOpen} onOpenChange={(open) => { setPasswordDialogOpen(open); if (!open) { setPassword(""); setPasswordUser(null); } }}>
        <DialogContent className={`${adminDialogContentClassName} max-w-lg`}>
          <DialogHeader className="border-b border-border/70 px-6 py-5 sm:px-7">
            <DialogTitle>Change password</DialogTitle>
          </DialogHeader>
          <div className={adminFormClassName}>
            <AdminFormSection
              title={passwordUser ? `Update password for ${passwordUser.display_name}` : "Update password"}
              description="Use a strong password and share it securely with the staff member."
            >
              <AdminField label="New Password">
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </AdminField>
            </AdminFormSection>
            <div className="flex justify-end">
              <Button onClick={handleChangePassword} className="rounded-xl px-6 shadow-sm">Save Password</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={recoveryDialogOpen} onOpenChange={(open) => { setRecoveryDialogOpen(open); if (!open) { setRecoveryUser(null); setGeneratedRecoveryKey(""); } }}>
        <DialogContent className={`${adminDialogContentClassName} max-w-lg`}>
          <DialogHeader className="border-b border-border/70 px-6 py-5 sm:px-7">
            <DialogTitle>Recovery key</DialogTitle>
          </DialogHeader>
          <div className={adminFormClassName}>
            <AdminFormSection
              title={recoveryUser ? `Generate a new recovery key for ${recoveryUser.display_name}` : "Generate recovery key"}
              description="This key is shown only once. Store it offline so the user can recover access without another admin."
            >
              {generatedRecoveryKey ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">One-time recovery key</p>
                    <p className="mt-2 break-all font-mono text-lg tracking-[0.18em] text-foreground">{generatedRecoveryKey}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Generating a new key rotates the previous one immediately.</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Generate a one-time key for password recovery.</p>
              )}
            </AdminFormSection>
            <div className="flex justify-end">
              <Button onClick={handleGenerateRecoveryKey} className="rounded-xl px-6 shadow-sm">
                {generatedRecoveryKey ? "Rotate Recovery Key" : "Generate Recovery Key"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
};

export default AdminUsers;
