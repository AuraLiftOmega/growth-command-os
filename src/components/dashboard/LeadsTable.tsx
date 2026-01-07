import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Plus,
  Users,
  Mail,
  Building
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Contact, useLiveContacts } from "@/hooks/useLiveContacts";

const LIFECYCLE_STAGES = [
  { value: 'subscriber', label: 'Subscriber', color: 'bg-muted text-muted-foreground' },
  { value: 'lead', label: 'Lead', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'mql', label: 'MQL', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'sql', label: 'SQL', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'opportunity', label: 'Opportunity', color: 'bg-primary/20 text-primary' },
  { value: 'customer', label: 'Customer', color: 'bg-success/20 text-success' },
];

export const LeadsTable = () => {
  const { contacts, isLoading, createContact, updateContact } = useLiveContacts();
  const [sortField, setSortField] = useState<keyof Contact>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    email: '',
    first_name: '',
    last_name: '',
    company: '',
    lifecycle_stage: 'lead',
  });

  const sortedContacts = [...contacts].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === null) return 1;
    if (bVal === null) return -1;
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleCreateContact = async () => {
    await createContact({
      email: newContact.email,
      first_name: newContact.first_name,
      last_name: newContact.last_name,
      company: newContact.company,
      lifecycle_stage: newContact.lifecycle_stage,
    });
    setNewContact({ email: '', first_name: '', last_name: '', company: '', lifecycle_stage: 'lead' });
    setIsDialogOpen(false);
  };

  const getStageInfo = (stage: string | null) => {
    return LIFECYCLE_STAGES.find(s => s.value === stage) || LIFECYCLE_STAGES[1];
  };

  const getLeadScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-amber-400';
    return 'text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Leads</CardTitle>
          <Badge variant="outline" className="ml-2">
            {contacts.length} contacts
          </Badge>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={newContact.first_name}
                    onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={newContact.last_name}
                    onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  placeholder="Acme Inc"
                />
              </div>
              <div className="space-y-2">
                <Label>Lifecycle Stage</Label>
                <Select 
                  value={newContact.lifecycle_stage}
                  onValueChange={(value) => setNewContact({ ...newContact, lifecycle_stage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LIFECYCLE_STAGES.map(stage => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreateContact}>
                Add Lead
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No leads yet. Add your first lead to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2">
                    <button 
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort('first_name')}
                    >
                      Name <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-2">
                    <button 
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort('email')}
                    >
                      Email <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-2">
                    <span className="text-xs font-medium text-muted-foreground">Company</span>
                  </th>
                  <th className="text-left py-3 px-2">
                    <button 
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort('lead_score')}
                    >
                      Score <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-2">
                    <span className="text-xs font-medium text-muted-foreground">Stage</span>
                  </th>
                  <th className="text-right py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {sortedContacts.slice(0, 20).map((contact, idx) => {
                  const stageInfo = getStageInfo(contact.lifecycle_stage);
                  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown';
                  return (
                    <motion.tr
                      key={contact.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="py-3 px-2">
                        <span className="font-medium text-sm">{fullName}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-muted-foreground">{contact.email || '-'}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          {contact.company && <Building className="w-3 h-3 text-muted-foreground" />}
                          <span className="text-sm">{contact.company || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-sm font-mono font-medium ${getLeadScoreColor(contact.lead_score)}`}>
                          {contact.lead_score ?? '-'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={`${stageInfo.color} border-0`}>
                          {stageInfo.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {LIFECYCLE_STAGES.filter(s => s.value !== contact.lifecycle_stage).map(stage => (
                              <DropdownMenuItem 
                                key={stage.value}
                                onClick={() => updateContact(contact.id, { lifecycle_stage: stage.value })}
                              >
                                Move to {stage.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
