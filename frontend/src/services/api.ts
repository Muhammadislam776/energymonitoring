import { User, Building, Floor, Room, Equipment, Meter, EnergyOverview, Anomaly, Recommendation, Alert, Report } from '../types';

const BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('energytwin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: 'Network response was not ok' }));
    throw new Error(errorBody.error || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async signup(data: { name: string; email: string; password: string; organization?: string; role?: string }) {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ user: User }>(res);
  },

  // Buildings
  async getBuildings(): Promise<Building[]> {
    const res = await fetch(`${BASE_URL}/buildings`, { headers: getAuthHeaders() });
    return handleResponse<Building[]>(res);
  },

  async getBuilding(id: string): Promise<Building & { floors: Floor[] }> {
    const res = await fetch(`${BASE_URL}/buildings/${id}`, { headers: getAuthHeaders() });
    return handleResponse<Building & { floors: Floor[] }>(res);
  },

  // Floors
  async getFloors(buildingId?: string): Promise<Floor[]> {
    const url = buildingId ? `${BASE_URL}/floors?buildingId=${buildingId}` : `${BASE_URL}/floors`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<Floor[]>(res);
  },

  async getFloor(id: string): Promise<Floor & { rooms: Room[] }> {
    const res = await fetch(`${BASE_URL}/floors/${id}`, { headers: getAuthHeaders() });
    return handleResponse<Floor & { rooms: Room[] }>(res);
  },

  // Rooms
  async getRooms(params?: { floorId?: string; buildingId?: string; type?: string }): Promise<Room[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/rooms?${query}`, { headers: getAuthHeaders() });
    return handleResponse<Room[]>(res);
  },

  async getRoomDetails(id: string): Promise<Room & { equipment: Equipment[]; alerts: Alert[]; anomalies: Anomaly[]; efficiency_score: number }> {
    const res = await fetch(`${BASE_URL}/rooms/${id}`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  // Equipment
  async getEquipment(params?: { buildingId?: string; floorId?: string; roomId?: string; type?: string; status?: string; search?: string }): Promise<Equipment[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/equipment?${query}`, { headers: getAuthHeaders() });
    return handleResponse<Equipment[]>(res);
  },

  async getEquipmentDetails(id: string): Promise<Equipment & { anomalies: Anomaly[] }> {
    const res = await fetch(`${BASE_URL}/equipment/${id}`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  // Meters
  async getMeters(params?: { buildingId?: string; status?: string; search?: string }): Promise<Meter[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/meters?${query}`, { headers: getAuthHeaders() });
    return handleResponse<Meter[]>(res);
  },

  async getMeterDetails(id: string): Promise<Meter & { recentReadings: any[] }> {
    const res = await fetch(`${BASE_URL}/meters/${id}`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async toggleMeterDisconnect(id: string): Promise<{ meter: Meter; status: string }> {
    const res = await fetch(`${BASE_URL}/meters/${id}/toggle-disconnect`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Energy
  async getEnergyOverview(buildingId?: string): Promise<EnergyOverview> {
    const url = buildingId ? `${BASE_URL}/energy/overview?buildingId=${buildingId}` : `${BASE_URL}/energy/overview`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<EnergyOverview>(res);
  },

  async getEnergyAnalytics(params?: { buildingId?: string; range?: string; granularity?: string }): Promise<any> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/energy/analytics?${query}`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async getEnergyHistory(params?: { page?: number; limit?: number; search?: string; buildingId?: string }): Promise<any> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/energy/history?${query}`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  // Anomalies
  async getAnomalies(params?: { buildingId?: string; severity?: string; status?: string }): Promise<Anomaly[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/anomalies?${query}`, { headers: getAuthHeaders() });
    return handleResponse<Anomaly[]>(res);
  },

  async updateAnomalyStatus(id: string, status: 'active' | 'investigating' | 'resolved'): Promise<Anomaly> {
    const res = await fetch(`${BASE_URL}/anomalies/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<Anomaly>(res);
  },

  // Forecasts
  async getForecasts(params?: { buildingId?: string; range?: string }): Promise<any> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/forecasts?${query}`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  // Recommendations
  async getRecommendations(params?: { buildingId?: string; status?: string }): Promise<Recommendation[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/recommendations?${query}`, { headers: getAuthHeaders() });
    return handleResponse<Recommendation[]>(res);
  },

  async updateRecommendationStatus(id: string, status: string): Promise<Recommendation> {
    const res = await fetch(`${BASE_URL}/recommendations/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<Recommendation>(res);
  },

  // Alerts
  async getAlerts(params?: { buildingId?: string; severity?: string; status?: string; search?: string }): Promise<Alert[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/alerts?${query}`, { headers: getAuthHeaders() });
    return handleResponse<Alert[]>(res);
  },

  async updateAlertStatus(id: string, status: 'acknowledged' | 'resolved'): Promise<Alert> {
    const res = await fetch(`${BASE_URL}/alerts/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<Alert>(res);
  },

  // Reports
  async getReports(buildingId?: string): Promise<Report[]> {
    const url = buildingId ? `${BASE_URL}/reports?buildingId=${buildingId}` : `${BASE_URL}/reports`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<Report[]>(res);
  },

  async generateReport(data: { type: string; building_id: string; period: string; format?: string }): Promise<Report> {
    const res = await fetch(`${BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Report>(res);
  },

  // Exports
  async getExportHistory(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/exports/history`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async generateExport(data: { dataset: string; format: string; buildingId?: string }): Promise<any> {
    const res = await fetch(`${BASE_URL}/exports/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // Users & Admin
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/users`, { headers: getAuthHeaders() });
    return handleResponse<User[]>(res);
  },

  async createUser(userData: any): Promise<User> {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse<User>(res);
  },

  async updateUser(id: string, userData: any): Promise<User> {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse<User>(res);
  },

  async deleteUser(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Tenants
  async getTenants(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/tenants`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  // Settings
  async getSettings(): Promise<any> {
    const res = await fetch(`${BASE_URL}/settings`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async updateSettings(settings: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse<any>(res);
  },

  async getAuditLogs(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/settings/audit-logs`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  // Copilot AI
  async askCopilot(message: string, buildingId?: string): Promise<{ reply: string; evidence: any[]; recommendations: string[]; suggestedFollowUps: string[] }> {
    const res = await fetch(`${BASE_URL}/copilot/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, buildingId }),
    });
    return handleResponse<any>(res);
  },

  // Simulator Triggers
  async triggerSpike(equipmentId: string, spikeKw?: number): Promise<any> {
    const res = await fetch(`${BASE_URL}/simulator/trigger-spike`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ equipmentId, spikeKw }),
    });
    return handleResponse<any>(res);
  },

  async resetSimulator(): Promise<any> {
    const res = await fetch(`${BASE_URL}/simulator/reset`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  async simulateDemandResponse(params: { setpointOffsetC: number; targetFloors: string[]; buildingId?: string }): Promise<any> {
    const res = await fetch(`${BASE_URL}/energy/demand-response-simulate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse<any>(res);
  },
};
