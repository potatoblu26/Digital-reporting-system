import { useState } from "react";
import { AlertTriangle, Pencil, Shield, Trash2, UserCheck, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useAppLanguage } from "../lib/appLanguage";
import {
  deleteUserAccount,
  getCurrentUser,
  getRoleLabel,
  getUsers,
  updateUserAdminControls,
  type AccountType,
  type OfficialPosition,
  type User,
  type VerificationStatus,
} from "../lib/mockData";

const officialPositions: OfficialPosition[] = ["Barangay Captain", "Kagawad", "Secretary / Staff"];

export default function UserManagement() {
  const user = getCurrentUser();
  const { language } = useAppLanguage();
  const t = language === "tl"
    ? {
        title: "User Management",
        description: "Tingnan at pamahalaan ang registered users",
        totalUsers: "Kabuuang Users",
        residents: "Residents",
        officials: "Officials / Admins",
        enabled: "Naka-enable ang Super Admin Account Controls",
        enabledDesc: "Puwede mong palitan ang approval status, role, at mag-delete ng accounts dito. Hindi puwedeng ipakita ang password dahil secure password hashes ang naka-store.",
        allUsers: "Lahat ng Users",
        registeredUsers: "Mga registered user sa system",
        name: "Name",
        email: "Email",
        barangay: "Barangay",
        role: "Role",
        status: "Status",
        registered: "Registered",
        actions: "Actions",
        currentAccount: "Current account",
        edit: "Edit",
        delete: "Delete",
      }
    : {
        title: "User Management",
        description: "View and manage registered users",
        totalUsers: "Total Users",
        residents: "Residents",
        officials: "Officials / Admins",
        enabled: "Super Admin Account Controls Enabled",
        enabledDesc: "You can change approval status, switch roles, and delete accounts here. Passwords cannot be shown because the system stores secure password hashes, not readable passwords.",
        allUsers: "All Users",
        registeredUsers: "Registered users in the system",
        name: "Name",
        email: "Email",
        barangay: "Barangay",
        role: "Role",
        status: "Status",
        registered: "Registered",
        actions: "Actions",
        currentAccount: "Current account",
        edit: "Edit",
        delete: "Delete",
      };
  const [users, setUsers] = useState<User[]>(getUsers());
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAccountType, setEditAccountType] = useState<AccountType>("resident");
  const [editApproval, setEditApproval] = useState<VerificationStatus>("pending");
  const [editPosition, setEditPosition] = useState<OfficialPosition>("Barangay Captain");

  if (!user) return null;

  const isSuperAdmin = user.accountType === "super_admin";
  const residents = users.filter((u) => u.accountType === "resident");
  const admins = users.filter((u) => u.role === "admin");

  const openDeleteDialog = (targetUser: User) => {
    setUserToDelete(targetUser);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (targetUser: User) => {
    setUserToEdit(targetUser);
    setEditAccountType(targetUser.accountType);
    setEditApproval(targetUser.verificationStatus);
    setEditPosition(targetUser.position ?? "Barangay Captain");
    setEditDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const deleted = await deleteUserAccount(userToDelete.id);
    if (!deleted) {
      toast.error("Unable to delete this account. Super Admin access is required.");
      return;
    }

    setUsers(getUsers());
    toast.success("Account deleted successfully.");
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleSaveUserControls = async () => {
    if (!userToEdit) return;

    const updated = await updateUserAdminControls(userToEdit.id, {
      accountType: editAccountType,
      role: editAccountType === "resident" ? "user" : "admin",
      verificationStatus: editApproval,
      position: editAccountType === "official" ? editPosition : undefined,
    });

    if (!updated) {
      toast.error("Unable to update this account. Super Admin access is required.");
      return;
    }

    setUsers(getUsers());
    toast.success("User role and approval updated successfully.");
    setEditDialogOpen(false);
    setUserToEdit(null);
  };

  return (
    <AppShell title={t.title} description={t.description}>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.totalUsers}</CardTitle>
            <UsersIcon className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.residents}</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{residents.length}</div>
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.officials}</CardTitle>
            <Shield className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{admins.length}</div>
          </CardContent>
        </Card>
      </div>

      {isSuperAdmin ? (
        <Card className="mb-6 border-amber-100 bg-amber-50/80 shadow-sm">
          <CardContent className="flex items-start gap-3 pt-6 text-sm text-amber-950">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">{t.enabled}</p>
              <p className="mt-1">{t.enabledDesc}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-white/80 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>{t.allUsers}</CardTitle>
          <CardDescription>{t.registeredUsers}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.email}</TableHead>
                  <TableHead>{t.barangay}</TableHead>
                  <TableHead>{t.role}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.registered}</TableHead>
                  {isSuperAdmin ? <TableHead className="text-right">{t.actions}</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((currentUser) => (
                  <TableRow key={currentUser.id}>
                    <TableCell className="font-medium">{currentUser.name}</TableCell>
                    <TableCell>{currentUser.email}</TableCell>
                    <TableCell>{currentUser.barangay}</TableCell>
                    <TableCell>
                      <Badge variant={currentUser.role === "admin" ? "default" : "secondary"}>
                        {getRoleLabel(currentUser)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={currentUser.verificationStatus === "approved" ? "default" : "outline"}>
                        {currentUser.verificationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{currentUser.createdAt.toLocaleDateString()}</TableCell>
                    {isSuperAdmin ? (
                      <TableCell className="text-right">
                        {currentUser.id === user.id ? (
                          <span className="text-xs text-slate-400">{t.currentAccount}</span>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg border-slate-200 bg-white"
                              onClick={() => openEditDialog(currentUser)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              {t.edit}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                              onClick={() => openDeleteDialog(currentUser)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t.delete}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {users.map((currentUser) => (
              <div key={currentUser.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{currentUser.name}</p>
                      <p className="break-all text-sm text-slate-500">{currentUser.email}</p>
                    </div>
                    <Badge variant={currentUser.verificationStatus === "approved" ? "default" : "outline"}>
                      {currentUser.verificationStatus}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={currentUser.role === "admin" ? "default" : "secondary"}>
                      {getRoleLabel(currentUser)}
                    </Badge>
                    <Badge variant="outline">{currentUser.barangay}</Badge>
                  </div>
                      <p className="text-xs text-slate-500">{t.registered} {currentUser.createdAt.toLocaleDateString()}</p>
                  {isSuperAdmin ? (
                    currentUser.id === user.id ? (
                      <p className="text-xs text-slate-400">{t.currentAccount}</p>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-lg border-slate-200 bg-white"
                          onClick={() => openEditDialog(currentUser)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {t.edit}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-lg border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                          onClick={() => openDeleteDialog(currentUser)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t.delete}
                        </Button>
                      </div>
                    )
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Controls</DialogTitle>
            <DialogDescription>
              Change the user&apos;s role setup and approval status. Password viewing is not available in this secure mock flow.
            </DialogDescription>
          </DialogHeader>
          {userToEdit ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p><span className="font-medium">User:</span> {userToEdit.name}</p>
                <p><span className="font-medium">Email:</span> {userToEdit.email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-account-type">Account Type / Role</Label>
                <Select value={editAccountType} onValueChange={(value) => setEditAccountType(value as AccountType)}>
                  <SelectTrigger id="edit-account-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resident">Resident</SelectItem>
                    <SelectItem value="official">Barangay Official</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editAccountType === "official" ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-position">Official Position</Label>
                  <Select value={editPosition} onValueChange={(value) => setEditPosition(value as OfficialPosition)}>
                    <SelectTrigger id="edit-position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {officialPositions.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="edit-approval">Approval Status</Label>
                <Select value={editApproval} onValueChange={(value) => setEditApproval(value as VerificationStatus)}>
                  <SelectTrigger id="edit-approval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUserControls}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently remove the selected account from the system.
            </DialogDescription>
          </DialogHeader>
          {userToDelete ? (
            <div className="space-y-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-900">
              <p>
                <span className="font-medium">User:</span> {userToDelete.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {userToDelete.email}
              </p>
              <p>This action will also remove that user&apos;s reports from the mock data.</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleDeleteUser}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
