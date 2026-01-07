import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, UserPlus, Search, Filter, Phone, Mail, 
  MessageSquare, TrendingUp, AlertCircle, Star,
  ArrowRight, Calendar, DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  lifecycle_stage: string;
  lead_score: number;
  churn_risk: number;
  total_revenue: number;
  last_interaction_at: string;
  tags: string[];
}

interface Deal {
  id: string;
  title: string;
  stage: string;
  amount: number;
  probability: number;
  expected_close_date: string;
  contact_id: string;
}

export const CRMDashboard = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (user) {
      fetchContacts();
      fetchDeals();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchContacts = async () => {
    const { data } = await supabase
      .from('crm_contacts')
      .select('*')
      .order('lead_score', { ascending: false })
      .limit(50);
    if (data) setContacts(data);
  };

  const fetchDeals = async () => {
    const { data } = await supabase
      .from('crm_deals')
      .select('*')
      .eq('is_active', true)
      .order('amount', { ascending: false });
    if (data) setDeals(data);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('crm-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_contacts' }, 
        () => fetchContacts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_deals' },
        () => fetchDeals())
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const getLifecycleColor = (stage: string) => {
    switch (stage) {
      case 'customer': return 'bg-green-500/20 text-green-400';
      case 'opportunity': return 'bg-blue-500/20 text-blue-400';
      case 'sql': return 'bg-purple-500/20 text-purple-400';
      case 'mql': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'closed_won': return 'bg-green-500';
      case 'negotiation': return 'bg-blue-500';
      case 'proposal': return 'bg-purple-500';
      case 'qualification': return 'bg-yellow-500';
      default: return 'bg-muted-foreground';
    }
  };

  const filteredContacts = contacts.filter(c => 
    `${c.first_name} ${c.last_name} ${c.email} ${c.company}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pipelineStages = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won'];

  return (
    <div className="space-y-6">
      {/* CRM Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-lg">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">360° CRM Hub</h1>
            <p className="text-muted-foreground">Complete customer intelligence • AI-powered insights</p>
          </div>
        </div>
        <Button className="bg-primary">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Contacts</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Active Deals</p>
                <p className="text-2xl font-bold">{deals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">${deals.reduce((sum, d) => sum + Number(d.amount), 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold">{contacts.filter(c => Number(c.churn_risk) > 0.5).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contact Database</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      placeholder="Search contacts..." 
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No contacts yet. They'll appear here as leads come in.</p>
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <div 
                        key={contact.id} 
                        className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedContact(contact)}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {contact.first_name?.[0]}{contact.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {contact.first_name} {contact.last_name}
                            </span>
                            <Badge className={getLifecycleColor(contact.lifecycle_stage)}>
                              {contact.lifecycle_stage}
                            </Badge>
                            {contact.lead_score >= 80 && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{contact.company}</span>
                            <span>{contact.email}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${Number(contact.total_revenue).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Lead Score: {contact.lead_score}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Deal Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {pipelineStages.map((stage) => {
                  const stageDeals = deals.filter(d => d.stage === stage);
                  const stageValue = stageDeals.reduce((sum, d) => sum + Number(d.amount), 0);
                  
                  return (
                    <div key={stage} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${getStageColor(stage)}`} />
                          <span className="text-sm font-medium capitalize">
                            {stage.replace('_', ' ')}
                          </span>
                        </div>
                        <Badge variant="outline">{stageDeals.length}</Badge>
                      </div>
                      <p className="text-lg font-bold">${stageValue.toLocaleString()}</p>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {stageDeals.map((deal) => (
                            <div key={deal.id} className="p-3 rounded-lg bg-muted/50 border">
                              <p className="font-medium text-sm truncate">{deal.title}</p>
                              <p className="text-lg font-bold text-primary">
                                ${Number(deal.amount).toLocaleString()}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {deal.probability}% likely
                                </span>
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Upsell Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contacts.slice(0, 5).map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div>
                        <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                        <p className="text-sm text-muted-foreground">{contact.company}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Churn Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contacts.filter(c => Number(c.churn_risk) > 0.3).slice(0, 5).map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div>
                        <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Risk: {(Number(contact.churn_risk) * 100).toFixed(0)}%
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="border-orange-500/50 text-orange-500">
                        Take Action
                      </Button>
                    </div>
                  ))}
                  {contacts.filter(c => Number(c.churn_risk) > 0.3).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No high-risk customers detected
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
