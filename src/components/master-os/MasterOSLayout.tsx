import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { MasterOSSidebar } from './MasterOSSidebar';
import { OrganizationProvider } from '@/hooks/useOrganization';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface Props {
  children: ReactNode;
}

export function MasterOSLayout({ children }: Props) {
  return (
    <OrganizationProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <MasterOSSidebar />
          <SidebarInset className="flex-1 flex flex-col">
            <header className="flex items-center justify-between h-12 px-4 border-b shrink-0">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center gap-2">
                <NotificationBell />
              </div>
            </header>
            <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </OrganizationProvider>
  );
}
