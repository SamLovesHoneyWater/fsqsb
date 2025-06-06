
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  startInstance, 
  stopInstance,
  startService,
  InstanceStatus,
  getInstanceStatus
} from "@/services/ec2Service";

export const useServerControl = (onStatusUpdate: () => void) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [instanceStatus, setInstanceStatus] = useState<InstanceStatus>({
    ipAddress: null,
    state: 'unknown'
  });

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const instanceResponse = await getInstanceStatus();
      if (instanceResponse.success && instanceResponse.data) {
        setInstanceStatus(instanceResponse.data);
        
        // Call the callback to start freshness timer
        onStatusUpdate();
      } else {
        toast({
          title: "Error",
          description: instanceResponse.error || "Failed to get instance status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInstance = async () => {
    setActionLoading("start-instance");
    try {
      await startInstance();
      // Set optimistic UI update
      setInstanceStatus(prev => ({ ...prev, state: 'pending' }));
      // Refresh status after a delay to give time for the operation to take effect
      setTimeout(() => fetchStatus(), 7000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopInstance = async () => {
    setActionLoading("stop-instance");
    try {
      await stopInstance();
      // Set optimistic UI update
      setInstanceStatus(prev => ({ ...prev, state: 'stopping' }));
      // Refresh status after a delay to give time for the operation to take effect
      setTimeout(() => fetchStatus(), 10000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartService = async () => {
    setActionLoading("start-service");
    try {
      await startService();
      // Set optimistic UI update for service start
      // Refresh status after a delay
      setTimeout(() => fetchStatus(), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  // Derived state
  const isInstanceRunning = instanceStatus.state === 'running';
  const isAnyActionInProgress = actionLoading !== null;
  
  // Activity state for each card based on the current instance state
  const instanceActive = () => {
    // Boot Up button/card is active only when instance is stopped and no action in progress
    return instanceStatus.state === 'stopped' && !isAnyActionInProgress;
  };
  
  const serviceActive = () => {
    // Play button/card is active only when instance is running and no action in progress
    return isInstanceRunning && !isAnyActionInProgress;
  };
  
  const shutdownActive = () => {
    // Shutdown button/card is active only when instance is running and no action in progress
    return isInstanceRunning && !isAnyActionInProgress;
  };

  return {
    loading,
    instanceStatus,
    actionLoading,
    fetchStatus,
    handleStartInstance,
    handleStopInstance,
    handleStartService,
    isInstanceRunning,
    isAnyActionInProgress,
    instanceActive: instanceActive(),
    serviceActive: serviceActive(),
    shutdownActive: shutdownActive()
  };
};
