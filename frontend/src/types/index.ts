export type UserRole = 'super_admin' | 'facility_manager' | 'energy_manager' | 'tenant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenant_id: string | null;
  tenant_name?: string;
  organization_name?: string;
  status: 'active' | 'inactive' | 'pending';
  last_login?: string;
}

export interface Building {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  name: string;
  address: string;
  area: number;
  floors_count: number;
  efficiency_score: number;
  status: string;
  current_power_kw?: number;
  today_kwh?: number;
  rooms_count?: number;
  equipment_count?: number;
  meters_count?: number;
  active_alerts_count?: number;
}

export interface Floor {
  id: string;
  building_id: string;
  name: string;
  floor_number: number;
  area: number;
  occupancy: number;
  energy_target: number;
  rooms_count?: number;
  current_power_kw?: number;
  total_capacity?: number;
  current_occupancy_total?: number;
}

export interface Room {
  id: string;
  floor_id: string;
  building_id: string;
  name: string;
  room_number: string;
  type: string;
  area: number;
  occupancy_capacity: number;
  current_occupancy: number;
  temperature: number;
  energy_target: number;
  coordinates_json?: string;
  current_power_kw?: number;
  equipment_count?: number;
  active_alerts_count?: number;
  floor_name?: string;
  floor_number?: number;
  building_name?: string;
}

export type EquipmentStatus = 'online' | 'offline' | 'warning' | 'maintenance' | 'critical';

export interface Equipment {
  id: string;
  room_id: string;
  building_id: string;
  floor_id: string;
  name: string;
  type: string;
  rated_power: number;
  current_power: number;
  status: EquipmentStatus;
  runtime_hours: number;
  efficiency: number;
  last_maintenance?: string;
  next_maintenance?: string;
  connected_meter_id?: string;
  room_name?: string;
  room_number?: string;
  floor_name?: string;
  floor_number?: number;
  building_name?: string;
  meter_status?: string;
}

export interface Meter {
  id: string;
  building_id: string;
  floor_id?: string;
  room_id?: string;
  equipment_id?: string;
  meter_type: string;
  status: 'connected' | 'disconnected' | 'warning';
  voltage: number;
  current: number;
  power: number;
  energy: number;
  power_factor: number;
  frequency: number;
  last_reading: string;
  last_communication?: string;
  building_name?: string;
  floor_name?: string;
  room_name?: string;
  room_number?: string;
  equipment_name?: string;
}

export interface KPIItem {
  value: number;
  unit: string;
  delta: string;
  isPositiveGood: boolean;
  status: 'normal' | 'healthy' | 'warning' | 'critical';
  sparkline: number[];
}

export interface EnergyOverview {
  kpis: {
    currentPower: KPIItem;
    todayConsumption: KPIItem;
    monthlyConsumption: KPIItem;
    peakDemand: KPIItem;
    estimatedCost: KPIItem;
    carbonEmissions: KPIItem;
    efficiencyScore: KPIItem;
    activeAlerts: KPIItem;
  };
  electrical: {
    voltage: number;
    current: number;
    powerFactor: number;
    frequency: number;
    power: number;
    carbonRate: number;
  };
}

export interface Anomaly {
  id: string;
  meter_id?: string;
  equipment_id?: string;
  building_id: string;
  floor_id?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  detected_at: string;
  measured_value: number;
  expected_value: number;
  difference_pct: number;
  confidence: number;
  explanation: string;
  evidence: {
    historicalBaseline?: string;
    occupancyFactor?: string;
    ambientTemp?: string;
    compressorStatus?: string;
    similarDaysComparison?: string;
    timeline?: Array<{ time: string; value: number; expected: number; note?: string }>;
    [key: string]: any;
  };
  status: 'active' | 'investigating' | 'resolved';
  building_name?: string;
  floor_name?: string;
  equipment_name?: string;
  meter_type?: string;
}

export interface Recommendation {
  id: string;
  building_id: string;
  title: string;
  description: string;
  potential_saving_pct: number;
  monthly_saving_usd: number;
  confidence: number;
  evidence: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'task_created' | 'implemented' | 'dismissed';
  building_name?: string;
}

export interface Alert {
  id: string;
  tenant_id: string;
  building_id?: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  location: string;
  current_value?: number;
  threshold?: number;
  status: 'new' | 'acknowledged' | 'resolved';
  created_at: string;
  building_name?: string;
}

export interface Report {
  id: string;
  tenant_id: string;
  building_id?: string;
  type: string;
  title: string;
  period: string;
  generated_at: string;
  file_format: string;
  data: any;
  building_name?: string;
}
