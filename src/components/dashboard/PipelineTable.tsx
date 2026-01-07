import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Plus,
  DollarSign,
  Calendar,
  TrendingUp
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
import { Deal, useLiveDeals } from "@/hooks/useLiveDeals";

const STAGES = [
  { value: 'lead', label: 'Lead', color: 'bg-muted text-muted-foreground' },
  { value: 'qualified', label: 'Qualified', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'proposal', label: 'Proposal', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'won', label: 'Won', color: 'bg-success/20 text-success' },
  { value: 'lost', label: 'Lost', color: 'bg-destructive/20 text-destructive' },
];

export const PipelineTable = () => {
  const { deals, isLoading, createDeal, updateDeal, deleteDeal } = useLiveDeals();
  const [sortField, setSortField] = useState<keyof Deal>('updated_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: '',
    amount: '',
    stage: 'lead',
    probability: '50',
  });

  const sortedDeals = [...deals].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === null) return 1;
    if (bVal === null) return -1;
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Deal) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleCreateDeal = async () => {
    await createDeal({
      title: newDeal.title,
      amount: parseFloat(newDeal.amount) || 0,
      stage: newDeal.stage,
      probability: parseInt(newDeal.probability) || 50,
    });
    setNewDeal({ title: '', amount: '', stage: 'lead', probability: '50' });
    setIsDialogOpen(false);
  };

  const getStageInfo = (stage: string | null) => {
    return STAGES.find(s => s.value === stage) || STAGES[0];
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Pipeline</CardTitle>
          <Badge variant="outline" className="ml-2">
            {deals.length} deals
          </Badge>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  placeholder="Deal title"
                />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={newDeal.amount}
                  onChange={(e) => setNewDeal({ ...newDeal, amount: e.target.value })}
                  placeholder="10000"
                />
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select 
                  value={newDeal.stage}
                  onValueChange={(value) => setNewDeal({ ...newDeal, stage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(stage => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Probability %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newDeal.probability}
                  onChange={(e) => setNewDeal({ ...newDeal, probability: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleCreateDeal}>
                Create Deal
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
        ) : deals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No deals yet. Create your first deal to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2">
                    <button 
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort('title')}
                    >
                      Deal <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-2">
                    <button 
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort('amount')}
                    >
                      Amount <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-2">
                    <button 
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => handleSort('stage')}
                    >
                      Stage <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-2">
                    <span className="text-xs font-medium text-muted-foreground">Probability</span>
                  </th>
                  <th className="text-right py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {sortedDeals.map((deal, idx) => {
                  const stageInfo = getStageInfo(deal.stage);
                  return (
                    <motion.tr
                      key={deal.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="py-3 px-2">
                        <span className="font-medium text-sm">{deal.title}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm font-mono">{formatCurrency(deal.amount)}</span>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={`${stageInfo.color} border-0`}>
                          {stageInfo.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${deal.probability || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{deal.probability || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {STAGES.filter(s => s.value !== deal.stage).map(stage => (
                              <DropdownMenuItem 
                                key={stage.value}
                                onClick={() => updateDeal(deal.id, { stage: stage.value })}
                              >
                                Move to {stage.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => deleteDeal(deal.id)}
                            >
                              Archive
                            </DropdownMenuItem>
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
