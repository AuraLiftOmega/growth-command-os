import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  Instagram, 
  Facebook, 
  Youtube,
  CheckCircle2,
  Clock,
  DollarSign,
  Sparkles,
  Filter,
  RefreshCw,
  MessageCircle,
  ArrowRight,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Comment {
  id: string;
  platform: string;
  comment_text: string;
  comment_author: string | null;
  dm_status: string | null;
  dm_text: string | null;
  outcome: string | null;
  revenue_attributed: number | null;
  created_at: string;
}

const platformIcons: Record<string, React.ElementType> = {
  tiktok: MessageSquare,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube
};

const platformColors: Record<string, string> = {
  tiktok: "bg-[#ff0050]/10 text-[#ff0050]",
  instagram: "bg-[#E4405F]/10 text-[#E4405F]",
  facebook: "bg-[#1877F2]/10 text-[#1877F2]",
  youtube: "bg-[#FF0000]/10 text-[#FF0000]"
};

const statusStyles: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  sent: { bg: "bg-blue-500/10", text: "text-blue-500" },
  delivered: { bg: "bg-green-500/10", text: "text-green-500" },
  converted: { bg: "bg-primary/10", text: "text-primary" },
  failed: { bg: "bg-destructive/10", text: "text-destructive" }
};

export const UnifiedInbox = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  // PURGED: No mock data - real comments only from database
  const mockComments: Comment[] = [];

  useEffect(() => {
    const fetchComments = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('comment_automations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setComments(data?.length ? data : mockComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments(mockComments);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [user]);

  const filteredComments = comments.filter(comment => {
    if (filter === "all") return true;
    if (filter === "pending") return comment.dm_status === "pending";
    if (filter === "converted") return comment.outcome === "converted";
    return comment.platform === filter;
  });

  const stats = {
    total: comments.length,
    pending: comments.filter(c => c.dm_status === "pending").length,
    converted: comments.filter(c => c.outcome === "converted").length,
    revenue: comments.reduce((sum, c) => sum + (c.revenue_attributed || 0), 0)
  };

  const formatTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Unified Inbox</h3>
              <p className="text-xs text-muted-foreground">Comment → DM → Conversion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Zap className="w-3 h-3" />
              Auto-Response ON
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={async () => {
                setIsLoading(true);
                try {
                  if (!user) return;
                  const { data, error } = await supabase
                    .from('comment_automations')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(50);
                  if (!error && data?.length) {
                    setComments(data);
                  }
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.converted}</p>
            <p className="text-xs text-muted-foreground">Converted</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">${stats.revenue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 border-b border-border">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="w-full justify-start bg-secondary/30">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
            <TabsTrigger value="converted" className="text-xs">Converted</TabsTrigger>
            <TabsTrigger value="tiktok" className="text-xs">TikTok</TabsTrigger>
            <TabsTrigger value="instagram" className="text-xs">Instagram</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Comments List */}
      <ScrollArea className="h-[400px]">
        <div className="p-3 space-y-2">
          <AnimatePresence>
            {filteredComments.map((comment, index) => {
              const PlatformIcon = platformIcons[comment.platform] || MessageSquare;
              const status = statusStyles[comment.dm_status || "pending"];
              
              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedComment(comment)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${
                    selectedComment?.id === comment.id ? 'border-primary bg-primary/5' : 'border-border bg-secondary/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Platform Icon */}
                    <div className={`p-2 rounded-lg ${platformColors[comment.platform]}`}>
                      <PlatformIcon className="w-4 h-4" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">
                          {comment.comment_author || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        "{comment.comment_text}"
                      </p>
                      
                      {/* Status & Revenue */}
                      <div className="flex items-center gap-2">
                        <Badge className={`${status.bg} ${status.text} text-xs`}>
                          {comment.dm_status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                          {comment.dm_status === "sent" && <Send className="w-3 h-3 mr-1" />}
                          {comment.dm_status === "delivered" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {comment.dm_status || "Pending"}
                        </Badge>
                        
                        {comment.outcome === "converted" && (
                          <Badge className="bg-green-500/10 text-green-500 text-xs">
                            <DollarSign className="w-3 h-3 mr-1" />
                            ${comment.revenue_attributed?.toFixed(0) || 0}
                          </Badge>
                        )}
                        
                        {comment.dm_text && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Response
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DM Preview */}
                  {selectedComment?.id === comment.id && comment.dm_text && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-border"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowRight className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-primary">AI-Generated DM</span>
                      </div>
                      <p className="text-sm bg-primary/5 p-3 rounded-lg">
                        {comment.dm_text}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filteredComments.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No comments in this filter</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
};
