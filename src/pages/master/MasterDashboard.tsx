import { MasterOSLayout } from '@/components/master-os/MasterOSLayout';
import { CommandDashboard } from '@/components/master-os/CommandDashboard';

export default function MasterDashboard() {
  return (
    <MasterOSLayout>
      <CommandDashboard />
    </MasterOSLayout>
  );
}
