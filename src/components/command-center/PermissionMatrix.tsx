import { motion } from "framer-motion";
import { 
  Shield, 
  Crown, 
  Users, 
  Megaphone, 
  Settings,
  Check,
  X,
  Lock,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Permission {
  action: string;
  ceo: boolean;
  sales: boolean;
  marketing: boolean;
  ops: boolean;
}

const permissions: Permission[] = [
  { action: "Edit North Star & Doctrine", ceo: true, sales: false, marketing: false, ops: false },
  { action: "Modify Language Rules", ceo: true, sales: false, marketing: false, ops: false },
  { action: "Approve/Reject Users", ceo: true, sales: false, marketing: false, ops: false },
  { action: "Edit Objection Responses", ceo: true, sales: false, marketing: false, ops: false },
  { action: "Change Pricing", ceo: true, sales: false, marketing: false, ops: false },
  { action: "Advance Rollout Phases", ceo: true, sales: false, marketing: false, ops: false },
  { action: "Execute Sales Calls", ceo: true, sales: true, marketing: false, ops: false },
  { action: "Use Approved Scripts", ceo: true, sales: true, marketing: true, ops: false },
  { action: "View Proof Assets", ceo: true, sales: true, marketing: true, ops: true },
  { action: "Deploy Approved Content", ceo: true, sales: false, marketing: true, ops: false },
  { action: "Add Proof Assets", ceo: true, sales: true, marketing: true, ops: false },
  { action: "View Dashboard", ceo: true, sales: true, marketing: true, ops: true },
  { action: "Offer Trials/Discounts", ceo: false, sales: false, marketing: false, ops: false },
  { action: "Create Custom Messages", ceo: true, sales: false, marketing: false, ops: false },
];

const roles = [
  { id: "ceo", label: "CEO", icon: Crown, color: "text-warning", bgColor: "bg-warning/20", description: "Full control" },
  { id: "sales", label: "Sales", icon: Users, color: "text-primary", bgColor: "bg-primary/20", description: "Execute only" },
  { id: "marketing", label: "Marketing", icon: Megaphone, color: "text-accent", bgColor: "bg-accent/20", description: "Deploy approved assets" },
  { id: "ops", label: "Ops", icon: Settings, color: "text-muted-foreground", bgColor: "bg-secondary", description: "No messaging authority" }
];

export const PermissionMatrix = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-6 border-l-4 border-l-destructive"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl">Permission & Control Matrix</h2>
            <p className="text-sm text-muted-foreground">Unauthorized edits blocked at system level</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-destructive" />
            <p className="font-medium text-destructive">SYSTEM DIRECTIVE</p>
          </div>
          <p className="text-sm text-foreground mt-1">
            This system exists to prevent strategy drift, enforce power positioning, and eliminate dependency on humans.
            Treat as core infrastructure, not documentation.
          </p>
        </div>
      </motion.div>

      {/* Role Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {roles.map((role, index) => {
          const Icon = role.icon;
          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="glass-card p-5"
            >
              <div className={`w-12 h-12 rounded-xl ${role.bgColor} flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 ${role.color}`} />
              </div>
              <h3 className={`font-display font-semibold text-lg ${role.color}`}>{role.label}</h3>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Permission Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-display font-semibold text-sm text-muted-foreground">
                  Action
                </th>
                {roles.map((role) => (
                  <th key={role.id} className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <role.icon className={`w-5 h-5 ${role.color}`} />
                      <span className={`text-xs font-medium ${role.color}`}>{role.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, index) => {
                const allBlocked = !perm.ceo && !perm.sales && !perm.marketing && !perm.ops;
                
                return (
                  <tr 
                    key={index} 
                    className={`border-b border-border/50 ${
                      allBlocked ? "bg-destructive/5" : index % 2 === 0 ? "bg-secondary/20" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {allBlocked && <AlertTriangle className="w-4 h-4 text-destructive" />}
                        <span className={`text-sm ${allBlocked ? "text-destructive font-medium" : "text-foreground"}`}>
                          {perm.action}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {perm.ceo ? (
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                          <X className="w-4 h-4 text-destructive" />
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {perm.sales ? (
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                          <X className="w-4 h-4 text-destructive" />
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {perm.marketing ? (
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                          <X className="w-4 h-4 text-destructive" />
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {perm.ops ? (
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                          <X className="w-4 h-4 text-destructive" />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Enforcement Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-lg bg-warning/10 border border-warning/30"
      >
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-warning shrink-0" />
          <div>
            <p className="font-medium text-warning">Enforcement Active</p>
            <p className="text-sm text-muted-foreground">
              Unauthorized actions are blocked at the system level. Role changes require CEO approval.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
