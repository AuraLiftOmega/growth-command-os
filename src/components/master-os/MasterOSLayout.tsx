import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MasterOSSidebar } from './MasterOSSidebar';
import { OrganizationProvider } from '@/hooks/useOrganization';

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
            <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </OrganizationProvider>
  );
}
