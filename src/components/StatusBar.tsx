
import StatusIndicator from "@/components/StatusIndicator";
import { InstanceStatus } from "@/services/ec2Service";

interface StatusBarProps {
  instanceStatus: InstanceStatus;
  statusFresh: boolean;
  isInstanceRunning: boolean;
}

const StatusBar = ({ 
  instanceStatus, 
  statusFresh,
  isInstanceRunning
}: StatusBarProps) => {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-2xl font-bold">FSQSB</h2>
      <div className="flex items-center gap-2">
        <StatusIndicator 
          status={instanceStatus.state} 
          isFresh={statusFresh}
        />
      </div>
    </div>
  );
};

export default StatusBar;
