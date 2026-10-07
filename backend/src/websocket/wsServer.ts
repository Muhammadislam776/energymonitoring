import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { db } from '../db/database';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();
let simulationInterval: NodeJS.Timeout | null = null;

export function initWebSocketServer(server: HttpServer) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    // Send immediate initial handshake and live status
    ws.send(JSON.stringify({
      type: 'connection.established',
      status: 'connected',
      clientCount: clients.size,
      timestamp: new Date().toISOString()
    }));

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (err) {
        // ignore malformed ping
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });
  });

  // Start background real-time telemetry streaming generator (every 2 seconds)
  startSimulationTicker();

  console.log('WebSocket telemetry server running on path /ws');
}

export function broadcastEvent(event: string, payload: any) {
  const message = JSON.stringify({
    type: event,
    data: payload,
    timestamp: new Date().toISOString()
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function startSimulationTicker() {
  if (simulationInterval) clearInterval(simulationInterval);

  simulationInterval = setInterval(() => {
    if (clients.size === 0) return; // Save cycles if nobody is listening

    try {
      // Apply slight realistic brownian noise to live meters
      const meters = db.prepare('SELECT id, power, status FROM meters WHERE status != "disconnected"').all() as any[];
      const updatedMeters: Array<{ id: string; power: number }> = [];

      const updateStmt = db.prepare('UPDATE meters SET power = ?, last_reading = CURRENT_TIMESTAMP WHERE id = ?');

      let buildingTotal = 0;
      for (const m of meters) {
        const jitter = (Math.random() - 0.49) * 0.8;
        let newP = Math.max(0.5, Number((m.power + jitter).toFixed(1)));
        if (m.id === 'meter-01') {
          // main incomer
          newP = Math.max(390, Math.min(520, Number((m.power + (Math.random() - 0.49) * 3.5).toFixed(1))));
          buildingTotal = newP;
        }
        updateStmt.run(newP, m.id);
        updatedMeters.push({ id: m.id, power: newP });
      }

      if (buildingTotal === 0) {
        buildingTotal = updatedMeters.reduce((acc, x) => acc + x.power, 0);
      }

      // Calculate floor totals
      const floorTotals = db.prepare(`
        SELECT f.id, f.floor_number, COALESCE(SUM(m.power), 0) as power_kw
        FROM floors f
        LEFT JOIN meters m ON f.id = m.floor_id
        GROUP BY f.id
      `).all() as any[];

      // Electrical grid harmonics
      const voltage = Number((400.0 + (Math.random() - 0.5) * 1.8).toFixed(1));
      const current = Number(((buildingTotal * 1000) / (voltage * 1.732 * 0.95)).toFixed(1));
      const powerFactor = Number((0.95 + (Math.random() - 0.5) * 0.02).toFixed(2));
      const frequency = Number((50.0 + (Math.random() - 0.5) * 0.08).toFixed(2));

      // Broadcast telemetry tick
      broadcastEvent('telemetry.tick', {
        buildingId: 'bldg-ettower-01',
        buildingPower: Number(buildingTotal.toFixed(1)),
        voltage,
        current,
        powerFactor,
        frequency,
        meters: updatedMeters.slice(0, 8), // send primary meters for efficient payload
        floors: floorTotals.map(f => ({ id: f.id, floorNumber: f.floor_number, powerKw: Number(f.power_kw.toFixed(1)) }))
      });
    } catch (err) {
      console.error('Error in simulation ticker:', err);
    }
  }, 2000);
}
