import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

export interface TelemetryTickData {
  buildingId: string;
  buildingPower: number;
  voltage: number;
  current: number;
  powerFactor: number;
  frequency: number;
  meters: Array<{ id: string; power: number }>;
  floors: Array<{ id: string; floorNumber: number; powerKw: number }>;
}

export interface WsNotification {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  liveData: TelemetryTickData | null;
  notifications: WsNotification[];
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [liveData, setLiveData] = useState<TelemetryTickData | null>({
    buildingId: 'bldg-ettower-01',
    buildingPower: 428.6,
    voltage: 401.2,
    current: 614.5,
    powerFactor: 0.95,
    frequency: 50.0,
    meters: [],
    floors: []
  });
  const [notifications, setNotifications] = useState<WsNotification[]>([
    {
      id: 'notif-init-1',
      title: 'Peak Demand Approaching Threshold',
      message: 'EnergyTwin Tower draw reached 621 kW (Limit: 650 kW)',
      severity: 'critical',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
    },
    {
      id: 'notif-init-2',
      title: 'HVAC-03 Unusually High Load',
      message: 'Continuous power draw 42.8 kW (56% above baseline)',
      severity: 'warning',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function connect() {
      // Connect to WS server via Vite proxy or direct port 5000
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:5000/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === 'telemetry.tick') {
              setLiveData(prev => ({
                ...(prev || {}),
                ...msg.data
              }));
            } else if (msg.type === 'alert.created') {
              const alertData = msg.data;
              const newNotif: WsNotification = {
                id: alertData.id || `notif-${Date.now()}`,
                title: alertData.title,
                message: alertData.message,
                severity: alertData.severity || 'warning',
                timestamp: alertData.created_at || new Date().toISOString()
              };
              setNotifications(prev => [newNotif, ...prev]);
            } else if (msg.type === 'anomaly.detected') {
              const anomData = msg.data;
              const newNotif: WsNotification = {
                id: anomData.id || `notif-${Date.now()}`,
                title: `AI Anomaly: ${anomData.title}`,
                message: `Measured ${anomData.measured} kW vs Expected ${anomData.expected} kW`,
                severity: 'warning',
                timestamp: new Date().toISOString()
              };
              setNotifications(prev => [newNotif, ...prev]);
            }
          } catch (err) {
            console.error('Error handling WS message', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, liveData, notifications, clearNotification, clearAllNotifications }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
