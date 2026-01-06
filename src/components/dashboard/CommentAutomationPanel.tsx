import { motion } from "framer-motion";
import { 
  MessageCircle, 
  Send, 
  ArrowRight,
  DollarSign,
  Users,
  TrendingUp
} from "lucide-react";

interface ConversationMetric {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

const metrics: ConversationMetric[] = [
  {
    label: "Comments Captured",
    value: "12,847",
    change: "+23%",
    icon: <MessageCircle className="w-4 h-4" />,
  },
  {
    label: "DMs Triggered",
    value: "4,312",
    change: "+18%",
    icon: <Send className="w-4 h-4" />,
  },
  {
    label: "Conversions",
    value: "847",
    change: "+31%",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Revenue Attributed",
    value: "$127.4K",
    change: "+42%",
    icon: <DollarSign className="w-4 h-4" />,
  },
];

interface RecentConversation {
  id: string;
  platform: "tiktok" | "instagram";
  comment: string;
  dmSent: string;
  outcome: "converted" | "qualified" | "pending";
  value?: string;
}

const conversations: RecentConversation[] = [
  {
    id: "1",
    platform: "tiktok",
    comment: "Where can I get this?? 😍",
    dmSent: "Hey! Thanks for the love! Here's your exclusive 15% off...",
    outcome: "converted",
    value: "$89",
  },
  {
    id: "2",
    platform: "instagram",
    comment: "Is this available in blue?",
    dmSent: "Yes! We have 5 colors available. Here's our catalog...",
    outcome: "qualified",
  },
  {
    id: "3",
    platform: "tiktok",
    comment: "Need this for summer!!",
    dmSent: "Perfect timing! Summer sale starts tomorrow. Want early access?",
    outcome: "pending",
  },
];

const outcomeStyles = {
  converted: "bg-success/10 text-success",
  qualified: "bg-primary/10 text-primary",
  pending: "bg-warning/10 text-warning",
};

export const CommentAutomationPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-success/10">
          <MessageCircle className="w-5 h-5 text-success" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg">Comment → DM → Conversion</h3>
          <p className="text-muted-foreground text-sm">Automated engagement engine</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
            className="p-3 rounded-lg bg-secondary/50"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              {metric.icon}
              <span className="text-xs">{metric.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold">{metric.value}</span>
              <span className="text-xs text-success">{metric.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Flow Visualization */}
      <div className="flex items-center justify-center gap-2 mb-6 py-4 px-6 bg-secondary/30 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span>Comment</span>
        </div>
        <ArrowRight className="w-4 h-4 text-primary" />
        <div className="flex items-center gap-2 text-sm">
          <Send className="w-4 h-4 text-muted-foreground" />
          <span>AI DM</span>
        </div>
        <ArrowRight className="w-4 h-4 text-primary" />
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span>Qualify</span>
        </div>
        <ArrowRight className="w-4 h-4 text-primary" />
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-success" />
          <span>Convert</span>
        </div>
      </div>

      {/* Recent Conversations */}
      <div>
        <h4 className="text-sm font-medium mb-3">Recent Automations</h4>
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      {conv.platform}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${outcomeStyles[conv.outcome]}`}>
                      {conv.outcome}
                    </span>
                    {conv.value && (
                      <span className="text-xs font-medium text-success">{conv.value}</span>
                    )}
                  </div>
                  <p className="text-sm mb-1">"{conv.comment}"</p>
                  <p className="text-xs text-muted-foreground truncate">
                    → {conv.dmSent}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
