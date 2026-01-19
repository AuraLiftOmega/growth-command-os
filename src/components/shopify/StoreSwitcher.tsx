import { useState } from "react";
import { 
  Store, 
  ChevronDown, 
  Check, 
  Plus,
  ExternalLink,
  User,
  Users,
  Zap,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useActiveStore, StoreRole } from "@/hooks/useActiveStore";
import { ConnectShopifyModal } from "@/components/settings/ConnectShopifyModal";

const roleConfig: Record<StoreRole, { label: string; icon: typeof Store; color: string }> = {
  platform: { label: 'Platform', icon: Store, color: 'text-primary' },
  personal: { label: 'Primary', icon: User, color: 'text-success' },
  customer: { label: 'Connected', icon: Users, color: 'text-accent' },
};

export function StoreSwitcher() {
  const { activeStore, userStores, setActiveStoreId, activeStoreId, hasConnectedStores } = useActiveStore();
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  // No store connected - show connect button
  if (!hasConnectedStores || !activeStore) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setConnectModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 h-auto border-dashed border-primary/50 text-primary hover:bg-primary/10"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Connect Shopify</span>
        </Button>
        <ConnectShopifyModal 
          open={connectModalOpen} 
          onOpenChange={setConnectModalOpen} 
        />
      </>
    );
  }

  const RoleIcon = roleConfig[activeStore.role].icon;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-3 py-2 h-auto bg-success/10 border-success/30 text-success hover:bg-success/20 hover:text-success"
          >
            <RoleIcon className="w-4 h-4" />
            <span className="max-w-[150px] truncate text-sm font-medium">
              {activeStore.storeName}
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {roleConfig[activeStore.role].label}
            </Badge>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80">
          <div className="px-3 py-2">
            <p className="text-sm font-medium">Switch Store Context</p>
            <p className="text-xs text-muted-foreground">
              Choose which store to display and manage
            </p>
          </div>
          <DropdownMenuSeparator />
          
          {/* User's Connected Stores */}
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-2">
            Your Connected Stores
            <Badge variant="secondary" className="text-[10px] px-1.5">{userStores.length}</Badge>
          </DropdownMenuLabel>
          {userStores.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-muted-foreground">No stores connected yet</p>
            </div>
          ) : (
            userStores.map((store) => {
              const config = roleConfig[store.role];
              const Icon = config.icon;
              const isActive = store.storeId === activeStoreId;
              
              return (
                <DropdownMenuItem
                  key={store.storeId}
                  onClick={() => setActiveStoreId(store.storeId || null)}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${
                    isActive ? 'bg-success/20' : 'bg-secondary'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      isActive ? 'text-success' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{store.storeName}</p>
                      {store.role === 'personal' && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Zap className="w-3 h-3 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent>Primary store with full API access</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {store.storeDomain}
                    </p>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-success" />}
                  <Badge variant="outline" className="text-[10px]">
                    {config.label}
                  </Badge>
                </DropdownMenuItem>
              );
            })
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => setConnectModalOpen(true)}
            className="flex items-center gap-3 p-3 cursor-pointer text-primary"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Connect New Store</p>
              <p className="text-xs text-muted-foreground">
                Add another Shopify store
              </p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => window.open(`https://${activeStore.storeDomain}/admin`, '_blank')}
            className="flex items-center gap-2 p-3 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">Open Shopify Admin</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConnectShopifyModal 
        open={connectModalOpen} 
        onOpenChange={setConnectModalOpen} 
      />
    </>
  );
}
