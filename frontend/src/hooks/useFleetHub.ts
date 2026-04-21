import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../stores/authStore';

export interface VehiclePosition {
  vehicleId: string;
  lat: number;
  lng: number;
  speed: number;
  fuel: number;
  timestampUtc: string;
  machineName: string;
  machineType: string;
}

export type ConnectionState = 'connected' | 'reconnecting' | 'disconnected';

const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export function useFleetHub() {
  const { token } = useAuthStore();
  const [positions, setPositions] = useState<Map<string, VehiclePosition>>(new Map());
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [activeVehicleIds, setActiveVehicleIds] = useState<Set<string>>(new Set());
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/fleet', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.onreconnecting(() => setConnectionState('reconnecting'));
    connection.onreconnected(() => setConnectionState('connected'));
    connection.onclose(() => setConnectionState('disconnected'));

    connection.on(
      'ReceivePositionUpdate',
      (update: VehiclePosition) => {
        setPositions((prev) => {
          const next = new Map(prev);
          next.set(update.vehicleId, update);
          return next;
        });
      }
    );

    connection
      .start()
      .then(() => setConnectionState('connected'))
      .catch(() => setConnectionState('disconnected'));

    return () => {
      connection.stop().catch(() => undefined);
    };
  }, [token]);

  // Update activeVehicleIds periodically based on last seen timestamp
  useEffect(() => {
    const compute = () => {
      const now = Date.now();
      const ids = new Set<string>();
      positions.forEach((pos) => {
        const ts = new Date(pos.timestampUtc).getTime();
        if (now - ts <= ACTIVE_THRESHOLD_MS) {
          ids.add(pos.vehicleId);
        }
      });
      setActiveVehicleIds(ids);
    };
    compute();
    const interval = setInterval(compute, 30_000);
    return () => clearInterval(interval);
  }, [positions]);

  return { positions, connectionState, activeVehicleIds };
}
