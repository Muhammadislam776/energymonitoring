import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/energy/overview
router.get('/overview', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { buildingId } = req.query;
  const bldgId = (buildingId as string) || 'bldg-ettower-01';

  // 1. Current Total Power from meters
  const powerRow = db.prepare(`
    SELECT COALESCE(SUM(power), 0) as current_power,
           COALESCE(AVG(voltage), 400.0) as avg_voltage,
           COALESCE(SUM(current), 0) as total_current,
           COALESCE(AVG(power_factor), 0.95) as avg_power_factor,
           COALESCE(AVG(frequency), 50.0) as avg_frequency
    FROM meters
    WHERE building_id = ?
  `).get(bldgId) as any;

  const currentPowerKw = Number((powerRow?.current_power || 428.6).toFixed(1));

  // 2. Today's consumption (kWh)
  const todayRow = db.prepare(`
    SELECT COALESCE(SUM(power * 2), 3842.0) as today_kwh,
           COALESCE(MAX(power), 621.0) as peak_demand
    FROM energy_readings
    WHERE building_id = ? AND timestamp >= date('now', 'start of day')
  `).get(bldgId) as any;

  const todayKwh = Math.round(todayRow?.today_kwh || 3842);
  const peakDemand = Number((todayRow?.peak_demand || 621.0).toFixed(1));

  // 3. Monthly consumption (MWh)
  const monthlyRow = db.prepare(`
    SELECT COALESCE(SUM(power * 2) / 1000.0, 112.4) as monthly_mwh
    FROM energy_readings
    WHERE building_id = ? AND timestamp >= date('now', 'start of month')
  `).get(bldgId) as any;

  const monthlyMwh = Number((monthlyRow?.monthly_mwh || 112.4).toFixed(1));

  // 4. Cost and carbon calculations (based on system settings)
  const settings = db.prepare(`SELECT cost_per_kwh, carbon_factor FROM system_settings LIMIT 1`).get() as any;
  const costPerKwh = settings?.cost_per_kwh || 0.16;
  const carbonFactor = settings?.carbon_factor || 0.42; // kg CO2e per kWh

  const estimatedCost = Math.round((monthlyMwh * 1000) * costPerKwh);
  const carbonTons = Number(((monthlyMwh * 1000 * carbonFactor) / 1000).toFixed(1));

  // 5. Active alerts count
  const alertsRow = db.prepare(`
    SELECT COUNT(*) as count FROM alerts
    WHERE (building_id = ? OR building_id IS NULL) AND status != 'resolved'
  `).get(bldgId) as any;

  // 6. Sparkline points for each KPI (last 7 days trend)
  const sparklineData = db.prepare(`
    SELECT strftime('%Y-%m-%d', timestamp) as day,
           SUM(power * 2) as daily_kwh,
           MAX(power) as daily_peak
    FROM energy_readings
    WHERE building_id = ?
    GROUP BY strftime('%Y-%m-%d', timestamp)
    ORDER BY day DESC
    LIMIT 7
  `).all(bldgId) as any[];

  return res.json({
    kpis: {
      currentPower: {
        value: currentPowerKw,
        unit: 'kW',
        delta: '+4.2%',
        isPositiveGood: false,
        status: 'normal',
        sparkline: [380, 410, 395, 420, 440, 415, currentPowerKw]
      },
      todayConsumption: {
        value: todayKwh,
        unit: 'kWh',
        delta: '-3.1%',
        isPositiveGood: false,
        status: 'healthy',
        sparkline: sparklineData.map(d => Math.round(d.daily_kwh)).reverse()
      },
      monthlyConsumption: {
        value: monthlyMwh,
        unit: 'MWh',
        delta: '-5.8%',
        isPositiveGood: false,
        status: 'healthy',
        sparkline: [98, 102, 108, 115, 110, 114, monthlyMwh]
      },
      peakDemand: {
        value: peakDemand,
        unit: 'kW',
        delta: '+1.5%',
        isPositiveGood: false,
        status: peakDemand > 600 ? 'warning' : 'normal',
        sparkline: [580, 595, 610, 590, 605, 618, peakDemand]
      },
      estimatedCost: {
        value: estimatedCost,
        unit: '$',
        delta: '-2.4%',
        isPositiveGood: false,
        status: 'normal',
        sparkline: [17500, 17800, 18200, 18600, 18100, 18350, estimatedCost]
      },
      carbonEmissions: {
        value: carbonTons,
        unit: 'tCO₂e',
        delta: '-4.6%',
        isPositiveGood: false,
        status: 'healthy',
        sparkline: [44.2, 45.8, 46.5, 48.0, 47.1, 47.9, carbonTons]
      },
      efficiencyScore: {
        value: 84,
        unit: '/100',
        delta: '+3 pts',
        isPositiveGood: true,
        status: 'healthy',
        sparkline: [78, 80, 81, 82, 83, 83, 84]
      },
      activeAlerts: {
        value: alertsRow?.count || 7,
        unit: '',
        delta: '+2 new',
        isPositiveGood: false,
        status: (alertsRow?.count || 0) > 5 ? 'critical' : 'normal',
        sparkline: [3, 4, 3, 5, 6, 5, alertsRow?.count || 7]
      }
    },
    electrical: {
      voltage: Number(powerRow.avg_voltage.toFixed(1)),
      current: Number(powerRow.total_current.toFixed(1)),
      powerFactor: Number(powerRow.avg_power_factor.toFixed(2)),
      frequency: Number(powerRow.avg_frequency.toFixed(1)),
      power: currentPowerKw,
      carbonRate: Number((currentPowerKw * carbonFactor).toFixed(2)) // kg CO2e / hr
    },
    solar: {
      generationKw: 64.2,
      dailySolarKwh: 412,
      selfConsumptionPct: 94,
      gridImportKw: Math.max(0, Number((currentPowerKw - 64.2).toFixed(1))),
      gridExportKw: 0.0,
      avoidedCarbonTodayKg: 173.0,
      treesEquivalentMonth: 38
    },
    energyFlow: {
      inflow: [
        { source: 'Metropolis Utility Grid', valueKw: Math.max(0, Number((currentPowerKw - 64.2).toFixed(1))), color: '#2563eb' },
        { source: 'Rooftop Solar PV Array', valueKw: 64.2, color: '#0ea5e9' }
      ],
      totalBusbarKw: currentPowerKw,
      outflow: [
        { consumer: 'Central HVAC & Chiller Plant', valueKw: 184.2, pct: 43, color: '#3b82f6' },
        { consumer: 'Tier-3 Data Center PDU Subsystems', valueKw: 112.5, pct: 26, color: '#6366f1' },
        { consumer: 'Elevator Banks & Hydraulic Pumps', valueKw: 51.6, pct: 12, color: '#8b5cf6' },
        { consumer: 'Architectural & Task Lighting', valueKw: 48.3, pct: 11, color: '#06b6d4' },
        { consumer: 'EV Fleet Fast Charging Station', valueKw: 32.0, pct: 8, color: '#10b981' }
      ]
    },
    tariffSchedule: {
      currentTier: 'On-Peak Tariff',
      currentRateUsd: 0.24,
      nextTier: 'Off-Peak ($0.08 / kWh at 20:00)',
      peakHours: '14:00 - 18:00',
      demandSurchargeLimitKw: 650.0,
      currentSafetyBufferKw: Number((650.0 - peakDemand).toFixed(1)),
      surchargePenaltyRate: '$14.50 / kW penalty'
    },
    weather: {
      ambientTempC: 26.4,
      humidityPct: 52,
      solarIrradianceWm2: 780,
      coolingDegreeDays: 4.2,
      forecastHighC: 29.0,
      conditions: 'Partly Sunny • Clear Sky'
    },
    indoorAirQuality: {
      avgCo2Ppm: 540,
      status: 'Optimal (< 800 ppm)',
      avgHumidityPct: 48,
      pm25UgM3: 8.4,
      vocIndex: 42
    }
  });
});

// GET /api/energy/analytics
router.get('/analytics', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { buildingId, floorId, range = '7d', granularity = 'daily' } = req.query;
  const bldgId = (buildingId as string) || 'bldg-ettower-01';

  // Calculate day limit
  const limitDays = range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;

  // 1. Consumption trend line chart
  const trendReadings = db.prepare(`
    SELECT strftime('%Y-%m-%d %H:00', timestamp) as time_label,
           strftime('%Y-%m-%d', timestamp) as day_label,
           strftime('%H:00', timestamp) as hour_label,
           AVG(power) as avg_kw,
           SUM(power * 2) as kwh,
           MAX(power) as peak_kw
    FROM energy_readings
    WHERE building_id = ? AND timestamp >= datetime('now', '-' || ? || ' days')
    GROUP BY ${granularity === 'hourly' ? "strftime('%Y-%m-%d %H:00', timestamp)" : "strftime('%Y-%m-%d', timestamp)"}
    ORDER BY timestamp ASC
  `).all(bldgId, limitDays) as any[];

  // 2. Energy by Floor
  const floorBreakdown = db.prepare(`
    SELECT f.name as floor_name, f.floor_number,
           COALESCE(SUM(e.current_power), 0) as current_kw,
           f.energy_target
    FROM floors f
    LEFT JOIN equipment e ON f.id = e.floor_id
    WHERE f.building_id = ?
    GROUP BY f.id
    ORDER BY f.floor_number ASC
  `).all(bldgId) as any[];

  // 3. Energy by Room (Top 8 consuming rooms)
  const roomBreakdown = db.prepare(`
    SELECT r.name as room_name, r.room_number, r.type as room_type,
           COALESCE(SUM(e.current_power), 0) as current_kw
    FROM rooms r
    LEFT JOIN equipment e ON r.id = e.room_id
    WHERE r.building_id = ?
    GROUP BY r.id
    ORDER BY current_kw DESC
    LIMIT 8
  `).all(bldgId) as any[];

  // 4. Energy by Equipment Type (Donut distribution)
  const equipmentDistribution = db.prepare(`
    SELECT e.type,
           ROUND(SUM(e.current_power), 1) as total_kw,
           COUNT(*) as count
    FROM equipment e
    WHERE e.building_id = ?
    GROUP BY e.type
    ORDER BY total_kw DESC
  `).all(bldgId) as any[];

  return res.json({
    trend: trendReadings.map(t => ({
      time: granularity === 'hourly' ? t.hour_label : t.day_label,
      fullTime: t.time_label,
      kwh: Math.round(t.kwh || 0),
      demandKw: Number((t.avg_kw || 0).toFixed(1)),
      peakKw: Number((t.peak_kw || 0).toFixed(1))
    })),
    floorBreakdown: floorBreakdown.map(f => ({
      name: f.floor_name,
      floorNumber: f.floor_number,
      consumptionKw: Number(f.current_kw.toFixed(1)),
      targetKw: f.energy_target
    })),
    roomBreakdown: roomBreakdown.map(r => ({
      room: `${r.room_number} ${r.room_name}`,
      kw: Number(r.current_kw.toFixed(1)),
      type: r.room_type
    })),
    equipmentDistribution: equipmentDistribution.map(eq => ({
      name: eq.type,
      value: eq.total_kw,
      count: eq.count
    }))
  });
});

// GET /api/energy/history
router.get('/history', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { page = '1', limit = '15', search = '', buildingId } = req.query;
  const p = Math.max(1, parseInt(page as string));
  const l = Math.min(100, Math.max(1, parseInt(limit as string)));
  const offset = (p - 1) * l;
  const bldgId = (buildingId as string) || 'bldg-ettower-01';

  let countQuery = `
    SELECT COUNT(*) as total
    FROM energy_readings er
    LEFT JOIN meters m ON er.meter_id = m.id
    LEFT JOIN floors f ON er.floor_id = f.id
    LEFT JOIN rooms r ON er.room_id = r.id
    WHERE er.building_id = ?
  `;

  let dataQuery = `
    SELECT er.id, er.timestamp, er.power, er.energy, er.voltage, er.current, er.power_factor,
           m.meter_type, m.id as meter_id,
           f.name as floor_name, f.floor_number,
           r.name as room_name, r.room_number
    FROM energy_readings er
    LEFT JOIN meters m ON er.meter_id = m.id
    LEFT JOIN floors f ON er.floor_id = f.id
    LEFT JOIN rooms r ON er.room_id = r.id
    WHERE er.building_id = ?
  `;

  const params: any[] = [bldgId];
  if (search) {
    const searchFilter = ` AND (m.id LIKE '%' || ? || '%' OR m.meter_type LIKE '%' || ? || '%' OR r.name LIKE '%' || ? || '%') `;
    countQuery += searchFilter;
    dataQuery += searchFilter;
    params.push(search, search, search);
  }

  dataQuery += ` ORDER BY er.timestamp DESC LIMIT ? OFFSET ? `;

  const total = (db.prepare(countQuery).get(...params) as any)?.total || 0;
  const rows = db.prepare(dataQuery).all(...params, l, offset) as any[];

  // Cost and carbon calculation
  const formatted = rows.map(r => ({
    id: r.id,
    date: r.timestamp,
    meterId: r.meter_id,
    meterType: r.meter_type || 'Main Feeder',
    floor: r.floor_name || 'Ground',
    room: r.room_name ? `${r.room_number} - ${r.room_name}` : 'Main Distribution',
    powerKw: Number(r.power.toFixed(1)),
    consumptionKwh: Number((r.power * 2).toFixed(1)),
    voltage: r.voltage,
    current: r.current,
    costUsd: Number((r.power * 2 * 0.16).toFixed(2)),
    carbonKg: Number((r.power * 2 * 0.42).toFixed(2))
  }));

  return res.json({
    data: formatted,
    pagination: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l)
    }
  });
});

// POST /api/energy/demand-response-simulate
router.post('/demand-response-simulate', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { setpointOffsetC = 1.5, targetFloors = ['fl-2', 'fl-3', 'fl-4'], buildingId = 'bldg-ettower-01' } = req.body;

  // Base cooling load
  const coolingBaseKw = 184.2;
  // Reduction ~ 7.2% per degree C
  const shedPct = Math.min(25, Number((setpointOffsetC * 7.2).toFixed(1)));
  const shedKw = Number(((coolingBaseKw * shedPct) / 100).toFixed(1));
  const newDemandKw = Number((428.6 - shedKw).toFixed(1));

  const peakWindowHours = 4;
  const onPeakRate = 0.24;
  const energySavedKwh = Number((shedKw * peakWindowHours).toFixed(1));
  const directCostSaved = Number((energySavedKwh * onPeakRate).toFixed(2));
  const demandPenaltySaved = Number((shedKw * 14.50).toFixed(2)); // avoid demand surcharge
  const totalFinancialYield = Number((directCostSaved + demandPenaltySaved).toFixed(2));

  return res.json({
    success: true,
    simulationParams: {
      setpointOffsetC,
      floorsCount: targetFloors.length,
      estimatedShedPercentage: shedPct
    },
    results: {
      loadShedKw: shedKw,
      newProjectedPowerKw: newDemandKw,
      energySavedKwh,
      peakTariffCostSavedUsd: directCostSaved,
      avoidedDemandChargeUsd: demandPenaltySaved,
      totalEventSavingsUsd: totalFinancialYield,
      comfortImpact: setpointOffsetC <= 1.0 ? 'Negligible (ASHRAE 55 Compliant)' : 'Slight Thermal Shift (Pre-cooled envelope mitigates)'
    }
  });
});

export default router;
