import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useWorkspace, WorkspaceRole } from "@/hooks/useWorkspace";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  UserPlus, Users, Shield, Eye, Edit3, Crown, 
  Loader2, Mail, Trash2, Clock, CheckCircle 
} from "lucide-react";
import { motion } from "framer-motion";

const ROLE_ICONS: Record<WorkspaceRole, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  editor: Edit3,
  viewer: Eye,
};

const ROLE_COLORS: Record<WorkspaceRole, string> = {
  owner: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  editor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  viewer: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const ROLE_DESCRIPTIONS: Record<WorkspaceRole, string> = {
  owner: "Full access, can delete workspace and transfer ownership",
  admin: "Manage users, all features except delete workspace",
  editor: "Create ads, post content, use AI features",
  viewer: "View-only access to dashboard and analytics",
};

export default function UsersManagement() {
  const { user } = useAuth();
  const { 
    workspace, userRole, members, invites, isLoading,
    canInvite, canManageUsers, isOwner,
    inviteUser, updateMemberRole, removeMember, cancelInvite, refetch
  } = useWorkspace();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("editor");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsInviting(true);
    const result = await inviteUser(inviteEmail.trim(), inviteRole);
    
    if (result.success) {
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteDialogOpen(false);
    } else {
      toast.error(result.error || "Failed to send invitation");
    }
    setIsInviting(false);
  };

  const handleRoleChange = async (memberId: string, newRole: WorkspaceRole) => {
    const result = await updateMemberRole(memberId, newRole);
    if (result.success) {
      toast.success("Role updated successfully");
    } else {
      toast.error(result.error || "Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId: string, email?: string) => {
    if (!confirm(`Remove ${email || 'this user'} from the workspace?`)) return;
    
    const result = await removeMember(memberId);
    if (result.success) {
      toast.success("Member removed");
    } else {
      toast.error(result.error || "Failed to remove member");
    }
  };

  const handleCancelInvite = async (inviteId: string, email: string) => {
    if (!confirm(`Cancel invitation for ${email}?`)) return;
    
    const result = await cancelInvite(inviteId);
    if (result.success) {
      toast.success("Invitation cancelled");
    } else {
      toast.error(result.error || "Failed to cancel invitation");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Permission check
  if (!canManageUsers && userRole !== 'owner' && userRole !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            You need Admin or Owner permissions to manage users.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const RoleIcon = userRole ? ROLE_ICONS[userRole] : Eye;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Team Members
            </h1>
            <p className="text-muted-foreground">
              Manage access to {workspace?.name || "your workspace"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className={ROLE_COLORS[userRole || 'viewer']}>
              <RoleIcon className="h-3 w-3 mr-1" />
              Your role: {userRole}
            </Badge>

            {canInvite && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-purple-600">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your workspace.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as WorkspaceRole)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {isOwner && (
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-purple-400" />
                                Admin
                              </div>
                            </SelectItem>
                          )}
                          <SelectItem value="editor">
                            <div className="flex items-center gap-2">
                              <Edit3 className="h-4 w-4 text-blue-400" />
                              Editor
                            </div>
                          </SelectItem>
                          <SelectItem value="viewer">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-gray-400" />
                              Viewer
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {ROLE_DESCRIPTIONS[inviteRole]}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInvite} disabled={isInviting}>
                      {isInviting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invitation
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Role Permissions Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(Object.keys(ROLE_ICONS) as WorkspaceRole[]).map((role) => {
            const Icon = ROLE_ICONS[role];
            return (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`border ${role === userRole ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={ROLE_COLORS[role]}>
                        <Icon className="h-3 w-3 mr-1" />
                        {role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {ROLE_DESCRIPTIONS[role]}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {canManageUsers && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const Icon = ROLE_ICONS[member.role];
                  const isCurrentUser = member.user_id === user?.id;
                  const isMemberOwner = member.role === 'owner';

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {member.email?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {member.email}
                              {isCurrentUser && <span className="text-muted-foreground ml-1">(you)</span>}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {canManageUsers && !isMemberOwner && !isCurrentUser ? (
                          <Select 
                            value={member.role} 
                            onValueChange={(v) => handleRoleChange(member.id, v as WorkspaceRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {isOwner && <SelectItem value="admin">Admin</SelectItem>}
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className={ROLE_COLORS[member.role]}>
                            <Icon className="h-3 w-3 mr-1" />
                            {member.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.accepted_at 
                          ? new Date(member.accepted_at).toLocaleDateString()
                          : "Pending"}
                      </TableCell>
                      {canManageUsers && (
                        <TableCell className="text-right">
                          {!isMemberOwner && !isCurrentUser && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveMember(member.id, member.email)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Invites */}
        {canInvite && invites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Invitations ({invites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {invite.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {invite.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleCancelInvite(invite.id, invite.email)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
