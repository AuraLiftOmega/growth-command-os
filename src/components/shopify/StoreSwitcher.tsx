import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Store, 
  ChevronDown, 
  Check, 
  Plus,
  ExternalLink 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveStore } from "@/hooks/useActiveStore";
import { ConnectShopifyModal } from "@/components/settings/ConnectShopifyModal";

export function StoreSwitcher() {
  const { activeStore, allStores, setActiveStoreId, activeStoreId } = useActiveStore();
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-3 py-2 h-auto bg-success/10 border-success/30 text-success hover:bg-success/20 hover:text-success"
          >
            <Store className="w-4 h-4" />
            <span className="max-w-[150px] truncate text-sm font-medium">
              {activeStore.storeName}
            </span>
            {activeStore.isDefault && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Default
              </Badge>
            )}
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-72">
          <div className="px-3 py-2">
            <p className="text-sm font-medium">Switch Store</p>
            <p className="text-xs text-muted-foreground">
              Select which store to display products from
            </p>
          </div>
          <DropdownMenuSeparator />
          
          {allStores.map((store) => (
            <DropdownMenuItem
              key={store.storeId || 'default'}
              onClick={() => setActiveStoreId(store.storeId || null)}
              className="flex items-center gap-3 p-3 cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${
                (store.storeId || null) === activeStoreId 
                  ? 'bg-success/20' 
                  : 'bg-secondary'
              }`}>
                <Store className={`w-4 h-4 ${
                  (store.storeId || null) === activeStoreId 
                    ? 'text-success' 
                    : 'text-muted-foreground'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{store.storeName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {store.storeDomain}
                </p>
              </div>
              {(store.storeId || null) === activeStoreId && (
                <Check className="w-4 h-4 text-success" />
              )}
              {store.isDefault && (
                <Badge variant="outline" className="text-[10px]">
                  Lovable
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
          
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
                Add your own Shopify store
              </p>
            </div>
          </DropdownMenuItem>

          {!activeStore.isDefault && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => window.open(`https://${activeStore.storeDomain}/admin`, '_blank')}
                className="flex items-center gap-2 p-3 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">Open Shopify Admin</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConnectShopifyModal 
        open={connectModalOpen} 
        onOpenChange={setConnectModalOpen} 
      />
    </>
  );
}
