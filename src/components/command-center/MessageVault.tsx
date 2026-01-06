import { useState } from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Copy, 
  Check, 
  Zap, 
  Brain, 
  DollarSign,
  Quote,
  Megaphone
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Message {
  id: string;
  category: string;
  text: string;
  useCase: string[];
}

const coreMessage = "If your agency could learn every hour, they wouldn't charge retainers. DOMINION does exactly that.";

const messagingPillars = [
  {
    id: "speed",
    title: "Speed",
    subtitle: "Minutes > Hours",
    icon: <Zap className="w-5 h-5" />,
    color: "text-warning",
    bgColor: "bg-warning/20",
    messages: [
      "Your agency takes weeks. This takes minutes.",
      "While they schedule calls, DOMINION is already scaling.",
      "Speed isn't a feature. It's the entire point."
    ]
  },
  {
    id: "learning",
    title: "Learning",
    subtitle: "Compounding Intelligence",
    icon: <Brain className="w-5 h-5" />,
    color: "text-primary",
    bgColor: "bg-primary/20",
    messages: [
      "Agencies don't compound. Systems do.",
      "Every hour makes it smarter. Can your team say that?",
      "Learning that never stops. Growth that never plateaus."
    ]
  },
  {
    id: "cost",
    title: "Cost Reality",
    subtitle: "Labor vs Systems",
    icon: <DollarSign className="w-5 h-5" />,
    color: "text-accent",
    bgColor: "bg-accent/20",
    messages: [
      "You're paying for people guessing, not results.",
      "Replace retainers with results.",
      "The cost of slow iteration is invisible—until it isn't."
    ]
  }
];

const useCaseMessages: Message[] = [
  {
    id: "ad-1",
    category: "Ads",
    text: "Your agency charges $10k/month to guess. DOMINION learns and scales for less.",
    useCase: ["Facebook", "Google", "LinkedIn"]
  },
  {
    id: "dm-1",
    category: "DMs",
    text: "Saw you're scaling. We built something that replaces agencies entirely. Not for beginners.",
    useCase: ["Instagram", "LinkedIn", "Twitter"]
  },
  {
    id: "sales-1",
    category: "Sales",
    text: "This replaces what you're already paying for. The question is timing.",
    useCase: ["Calls", "Demos", "Follow-ups"]
  },
  {
    id: "pr-1",
    category: "PR",
    text: "The age of human-dependent creative scaling is ending. DOMINION is what comes next.",
    useCase: ["Press", "Podcasts", "Interviews"]
  }
];

export const MessageVault = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Core Market Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-6 border-l-4 border-l-accent"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Core Market Message</h2>
              <p className="text-sm text-muted-foreground">The one message that defines everything</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => copyToClipboard(coreMessage, "core")}
            className="gap-2"
          >
            {copiedId === "core" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy
          </Button>
        </div>

        <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
          <Quote className="w-6 h-6 text-accent mb-2" />
          <p className="text-xl font-display font-semibold text-foreground">
            {coreMessage}
          </p>
        </div>
      </motion.div>

      {/* 3 Messaging Pillars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="font-display font-semibold text-lg mb-4">3 Messaging Pillars</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {messagingPillars.map((pillar, index) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg ${pillar.bgColor} flex items-center justify-center`}>
                  <span className={pillar.color}>{pillar.icon}</span>
                </div>
                <div>
                  <h4 className={`font-display font-semibold ${pillar.color}`}>{pillar.title}</h4>
                  <p className="text-xs text-muted-foreground">{pillar.subtitle}</p>
                </div>
              </div>

              <div className="space-y-2">
                {pillar.messages.map((msg, i) => (
                  <div 
                    key={i}
                    className="group p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all cursor-pointer"
                    onClick={() => copyToClipboard(msg, `${pillar.id}-${i}`)}
                  >
                    <p className="text-sm text-foreground">{msg}</p>
                    <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedId === `${pillar.id}-${i}` ? (
                        <Check className="w-3 h-3 text-accent" />
                      ) : (
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Use Case Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-display font-semibold text-lg mb-4">Reusable Messages by Channel</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {useCaseMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {message.category}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(message.text, message.id)}
                  className="h-8 w-8 p-0"
                >
                  {copiedId === message.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              
              <p className="text-foreground font-medium mb-3">"{message.text}"</p>
              
              <div className="flex flex-wrap gap-1">
                {message.useCase.map((use) => (
                  <Badge key={use} variant="outline" className="text-xs text-muted-foreground">
                    {use}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
