import bcrypt from 'bcryptjs';
import { db, initDatabase } from './database';

export function runSeed() {
  initDatabase();

  console.log('Seeding EnergyTwin database with comprehensive realistic demo data...');

  // Clear existing data safely
  const tables = [
    'audit_logs', 'reports', 'alerts', 'recommendations', 'forecasts',
    'anomalies', 'energy_readings', 'meters', 'equipment', 'rooms',
    'floors', 'buildings', 'users', 'tenants', 'organizations', 'system_settings'
  ];

  for (const table of tables) {
    db.prepare(`DELETE FROM ${table}`).run();
  }

  // 1. Organization
  const orgId = 'org-energytwin-01';
  db.prepare(`
    INSERT INTO organizations (id, name, logo)
    VALUES (?, ?, ?)
  `).run(orgId, 'EnergyTwin Global Enterprise', '/logo.svg');

  // 2. Tenants (Multi-tenant support)
  const tenant1Id = 'tenant-metropolis-01';
  const tenant2Id = 'tenant-apex-tech-02';
  db.prepare(`
    INSERT INTO tenants (id, name, organization_id, code)
    VALUES (?, ?, ?, ?), (?, ?, ?, ?)
  `).run(
    tenant1Id, 'Metropolis Facilities Corp', orgId, 'METRO-01',
    tenant2Id, 'Apex Technologies LLC', orgId, 'APEX-02'
  );

  // 3. Users with pre-hashed passwords
  const passwordHash = bcrypt.hashSync('Password123!', 10);
  const adminHash = bcrypt.hashSync('admin123', 10);
  const facilityHash = bcrypt.hashSync('facility123', 10);
  const energyHash = bcrypt.hashSync('energy123', 10);
  const tenantHash = bcrypt.hashSync('tenant123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, tenant_id, organization_name, status, last_login)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', datetime('now', '-2 hours'))
  `);

  insertUser.run('usr-admin-01', 'Sarah Jenkins', 'admin@energytwin.com', adminHash, 'super_admin', tenant1Id, 'EnergyTwin HQ');
  insertUser.run('usr-facility-01', 'David Miller', 'facility@energytwin.com', facilityHash, 'facility_manager', tenant1Id, 'Metropolis Facilities');
  insertUser.run('usr-energy-01', 'Elena Rostova', 'energy@energytwin.com', energyHash, 'energy_manager', tenant1Id, 'Metropolis Facilities');
  insertUser.run('usr-tenant-01', 'Marcus Vance', 'tenant@apextech.com', tenantHash, 'tenant', tenant2Id, 'Apex Technologies');

  // 4. Buildings: "EnergyTwin Tower" (Primary) and "West Campus Innovation Hub" (Secondary)
  const bldg1Id = 'bldg-ettower-01';
  const bldg2Id = 'bldg-westcampus-02';

  db.prepare(`
    INSERT INTO buildings (id, tenant_id, name, address, area, floors_count, efficiency_score, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    bldg1Id, tenant1Id, 'EnergyTwin Tower', '100 Innovation Boulevard, Tech District, Metropolis', 38500.0, 6, 84, 'operational',
    bldg2Id, tenant2Id, 'West Campus Innovation Hub', '450 Silicon Avenue, West Campus', 22000.0, 4, 78, 'operational'
  );

  // 5. Floors for EnergyTwin Tower (6 Floors)
  // Floor 0: Basement & Central Utility Plant (Chillers, Boilers, Transformers)
  // Floor 1: Ground Floor - Grand Lobby, Exhibition & Security Hub
  // Floor 2: High-Density Workspace & Conference Center
  // Floor 3: Engineering R&D & Server Data Center
  // Floor 4: Apex Tech Executive Suites & Labs (Tenant-assigned floor)
  // Floor 5: Penthouse, Wellness, Executive Boardroom & Solar Array Hub
  const floorsData = [
    { id: 'fl-b1', name: 'Level B1 - Central Plant & Utilities', num: 0, area: 6500, occ: 12, target: 850.0 },
    { id: 'fl-1', name: 'Level 1 - Grand Lobby & Reception', num: 1, area: 6200, occ: 85, target: 380.0 },
    { id: 'fl-2', name: 'Level 2 - Open Workspace & Conf Center', num: 2, area: 6400, occ: 160, target: 520.0 },
    { id: 'fl-3', name: 'Level 3 - Engineering & Tech Labs', num: 3, area: 6400, occ: 145, target: 680.0 },
    { id: 'fl-4', name: 'Level 4 - Enterprise Tenant Offices', num: 4, area: 6500, occ: 110, target: 490.0 },
    { id: 'fl-5', name: 'Level 5 - Penthouse & Solar Rooftop', num: 5, area: 6500, occ: 45, target: 410.0 },
  ];

  const insertFloor = db.prepare(`
    INSERT INTO floors (id, building_id, name, floor_number, area, occupancy, energy_target)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const f of floorsData) {
    insertFloor.run(f.id, bldg1Id, f.name, f.num, f.area, f.occ, f.target);
  }

  // Also add 2 floors to second building for multi-building demo
  insertFloor.run('fl-wc-1', bldg2Id, 'Ground Level Hub', 1, 5500, 75, 420.0);
  insertFloor.run('fl-wc-2', bldg2Id, 'Upper Lab Level', 2, 5500, 90, 480.0);

  // 6. Rooms (48 Rooms for EnergyTwin Tower: 8 rooms per floor)
  const roomTypes = ['Office', 'Meeting Room', 'Server Room', 'Storage', 'Corridor', 'Lobby', 'Laboratory', 'Retail'];
  const rooms: Array<{
    id: string; floor_id: string; name: string; room_number: string;
    type: string; area: number; cap: number; occ: number; temp: number; target: number;
    coords: { x: number; y: number; w: number; h: number }
  }> = [];

  const roomNamesByFloor: Record<number, string[]> = {
    0: ['Primary Chiller Hall', 'Boiler Room', 'Main Switchgear Room', 'Backup Generator Bay', 'Water Pump Substation', 'Facility Workshop', 'Utility Tunnel Storage', 'Plant Control Center'],
    1: ['Grand Atrium Lobby', 'Security & Visitor Center', 'Coffee Bar & Lounge', 'Auditorium 101', 'Retail Banking Suite', 'Mail & Logistics Room', 'Public Gallery', 'Restroom Facility North'],
    2: ['North Open Workspace', 'South Collaborative Hub', 'Boardroom Alpha', 'Sprint Room Beta', 'Video Conf Suite Gamma', 'Quiet Focus Pods', 'Pantry & Breakout Cafe', 'Print & Utility Hub'],
    3: ['Software Engineering Bay', 'Hardware Prototyping Lab', 'Tier-3 Data Center', 'Network Operations Center', 'Firmware Test Bench', 'Design Thinking Studio', 'Server Cooling Airway', 'Tech Team Briefing Room'],
    4: ['Apex Executive Suite', 'Finance Analytics Hub', 'Client Experience Suite', 'Legal & Strategy Chamber', 'Tenant Data Archive', 'East Wing Workstation', 'West Wing Flex Desks', 'Tenant Boardroom Apex'],
    5: ['Executive Penthouse Office', 'VIP Boardroom Zenith', 'Sky Lounge & Garden', 'Wellness & Fitness Studio', 'Rooftop Solar Inverter Hub', 'Building Automation Central', 'Private Dining Pavilion', 'Mechanical Penthouse'],
  };

  const roomTypeMap: Record<string, string> = {
    'Primary Chiller Hall': 'Laboratory',
    'Boiler Room': 'Storage',
    'Main Switchgear Room': 'Server Room',
    'Backup Generator Bay': 'Storage',
    'Water Pump Substation': 'Storage',
    'Plant Control Center': 'Office',
    'Grand Atrium Lobby': 'Lobby',
    'Security & Visitor Center': 'Office',
    'Coffee Bar & Lounge': 'Retail',
    'Auditorium 101': 'Meeting Room',
    'Retail Banking Suite': 'Retail',
    'North Open Workspace': 'Office',
    'South Collaborative Hub': 'Office',
    'Boardroom Alpha': 'Meeting Room',
    'Tier-3 Data Center': 'Server Room',
    'Hardware Prototyping Lab': 'Laboratory',
    'Software Engineering Bay': 'Office',
    'Network Operations Center': 'Server Room',
    'Apex Executive Suite': 'Office',
    'Finance Analytics Hub': 'Office',
    'VIP Boardroom Zenith': 'Meeting Room',
    'Rooftop Solar Inverter Hub': 'Laboratory',
  };

  const insertRoom = db.prepare(`
    INSERT INTO rooms (id, floor_id, building_id, name, room_number, type, area, occupancy_capacity, current_occupancy, temperature, energy_target, coordinates_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let roomCounter = 1;
  for (const floor of floorsData) {
    const names = roomNamesByFloor[floor.num] || [];
    for (let rIdx = 0; rIdx < 8; rIdx++) {
      const roomNum = `${floor.num === 0 ? 'B1' : floor.num}${String(rIdx + 1).padStart(2, '0')}`;
      const name = names[rIdx] || `Room ${roomNum}`;
      const type = roomTypeMap[name] || (rIdx === 2 || rIdx === 3 ? 'Meeting Room' : rIdx === 6 ? 'Storage' : 'Office');
      const area = Math.round(500 + (rIdx * 75) + ((rIdx % 3) * 120));
      const cap = Math.round(area / 25);
      const occ = Math.round(cap * 0.65);
      const temp = Number((21.5 + (Math.sin(rIdx) * 1.8)).toFixed(1));
      const target = Number((area * 0.08).toFixed(1));

      // Grid coords for visual floor plan layout (4 columns x 2 rows)
      const col = rIdx % 4;
      const row = Math.floor(rIdx / 4);
      const coords = {
        x: 40 + col * 230,
        y: 40 + row * 180,
        w: 210,
        h: 160
      };

      const roomId = `rm-${roomNum.toLowerCase()}`;
      rooms.push({ id: roomId, floor_id: floor.id, name, room_number: roomNum, type, area, cap, occ, temp, target, coords });

      insertRoom.run(
        roomId, floor.id, bldg1Id, name, roomNum, type, area, cap, occ, temp, target, JSON.stringify(coords)
      );
      roomCounter++;
    }
  }

  // 7. Equipment (120 Equipment Units)
  // HVAC, Chillers, Boilers, Lighting, Elevators, Pumps, Servers, Generators, etc.
  const equipmentTypes = ['HVAC', 'Chiller', 'Boiler', 'Lighting', 'Elevator', 'Pump', 'Server', 'Generator', 'Air Conditioner'];
  const insertEquipment = db.prepare(`
    INSERT INTO equipment (id, room_id, building_id, floor_id, name, type, rated_power, current_power, status, runtime_hours, efficiency, last_maintenance, next_maintenance, connected_meter_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-30 days'), datetime('now', '+60 days'), ?)
  `);

  let equipIndex = 1;
  const equipmentList: Array<{ id: string; name: string; type: string; roomId: string; rated: number; current: number; status: string }> = [];

  for (const r of rooms) {
    // 2 to 3 equipment items per room = ~120 total
    const count = r.type === 'Server Room' ? 4 : r.type === 'Laboratory' ? 3 : 2;
    for (let k = 0; k < count && equipIndex <= 120; k++) {
      let eqType = 'Lighting';
      let rated = 4.5;
      let curr = 3.2;
      let status = 'online';

      if (r.type === 'Server Room') {
        eqType = k === 0 ? 'Server' : k === 1 ? 'HVAC' : k === 2 ? 'Pump' : 'Server';
        rated = eqType === 'Server' ? 45.0 : 25.0;
        curr = rated * 0.82;
      } else if (r.name.includes('Chiller')) {
        eqType = 'Chiller';
        rated = 95.0;
        curr = 68.4;
      } else if (r.name.includes('Boiler')) {
        eqType = 'Boiler';
        rated = 55.0;
        curr = 32.1;
      } else if (r.name.includes('Elevator') || r.name.includes('Atrium')) {
        eqType = k === 0 ? 'Elevator' : 'Lighting';
        rated = eqType === 'Elevator' ? 35.0 : 8.5;
        curr = rated * 0.6;
      } else {
        eqType = k === 0 ? 'HVAC' : 'Lighting';
        rated = eqType === 'HVAC' ? 18.0 : 5.0;
        curr = rated * 0.7;
      }

      // Introduce specific realistic status variations for demo
      if (equipIndex === 3) {
        // High consumption HVAC-03 anomaly
        status = 'warning';
        curr = 42.8; // Rated 22kW, running hot
      } else if (equipIndex === 14) {
        status = 'critical';
        curr = 0.0; // offline / tripped breaker
      } else if (equipIndex === 28) {
        status = 'maintenance';
        curr = 1.2;
      }

      const eqId = `eq-${equipIndex.toString().padStart(3, '0')}`;
      const eqName = `${eqType}-${equipIndex.toString().padStart(2, '0')}`;

      equipmentList.push({ id: eqId, name: eqName, type: eqType, roomId: r.id, rated, current: curr, status });

      insertEquipment.run(
        eqId, r.id, bldg1Id, r.floor_id, eqName, eqType, rated, curr, status,
        Math.round(1200 + equipIndex * 24.5), Number((88 + (equipIndex % 10)).toFixed(1)), `meter-${((equipIndex % 24) + 1).toString().padStart(2, '0')}`
      );
      equipIndex++;
    }
  }

  // 8. Smart Meters (24 Smart Meters across the building)
  const insertMeter = db.prepare(`
    INSERT INTO meters (id, building_id, floor_id, room_id, equipment_id, meter_type, status, voltage, current, power, energy, power_factor, frequency, last_reading, last_communication)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 minutes'), datetime('now', '-2 minutes'))
  `);

  const meterTypes = [
    'Main Incomer Feeder', 'Solar Bi-directional Submeter', 'Chiller Plant Feed', 'Boiler Submeter',
    'Floor 1 Distribution Feeder', 'Floor 2 Distribution Feeder', 'Floor 3 Distribution Feeder',
    'Floor 4 Distribution Feeder', 'Floor 5 Distribution Feeder', 'Data Center Server PDU-A',
    'Data Center Server PDU-B', 'Elevator Bank Submeter', 'HVAC Zone 1 Submeter', 'HVAC Zone 2 Submeter',
    'Lighting Busway A', 'Lighting Busway B', 'Emergency Generator Output', 'Rooftop Chiller Feeder',
    'EV Charging Station Array', 'Kitchen & Retail Submeter', 'Water Booster Pump Submeter',
    'Lab Cleanroom Submeter', 'Executive Suite Submeter', 'Facility Workshop Submeter'
  ];

  for (let m = 1; m <= 24; m++) {
    const mId = `meter-${m.toString().padStart(2, '0')}`;
    const mType = meterTypes[m - 1] || 'Submeter';
    const floorIndex = (m % 6);
    const floor = floorsData[floorIndex];
    let status = 'connected';
    let power = 28.5 + (m * 2.3);
    let voltage = 400.2 + (Math.sin(m) * 1.5);
    let current = Number((power * 1000 / (voltage * 1.732 * 0.95)).toFixed(1));
    let energyKwh = Math.round(14500 + m * 850);

    if (m === 1) {
      // Main Incomer
      power = 428.6;
      current = 650.4;
      energyKwh = 184500;
    } else if (m === 7) {
      // Offline meter for testing alerts
      status = 'disconnected';
      power = 0;
      current = 0;
    } else if (m === 3) {
      status = 'warning';
      power = 78.4;
    }

    insertMeter.run(
      mId, bldg1Id, floor.id, rooms[m % rooms.length].id, equipmentList[m % equipmentList.length]?.id || null,
      mType, status, Number(voltage.toFixed(1)), current, Number(power.toFixed(1)), energyKwh, 0.95, 50.0
    );
  }

  // 9. Historical Energy Readings (Realistic 30-day time series data for analytics, charts & ML evidence)
  console.log('Generating realistic 30-day energy time series readings...');
  const insertReading = db.prepare(`
    INSERT INTO energy_readings (id, meter_id, building_id, floor_id, room_id, timestamp, power, energy, voltage, current, power_factor)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const insertManyReadings = db.transaction(() => {
    // Generate readings every 2 hours for the last 30 days = 360 intervals
    let readingId = 1;
    let cumulativeEnergy = 112000.0;

    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const isWeekend = (now.getDay() - dayOffset + 700) % 7 === 0 || (now.getDay() - dayOffset + 700) % 7 === 6;

      for (let hour = 0; hour < 24; hour += 2) {
        const timePoint = new Date(now.getTime() - (dayOffset * 86400000) + (hour * 3600000));
        const isoString = timePoint.toISOString().replace('T', ' ').substring(0, 19);

        // Diurnal load curve: base overnight ~160 kW, ramps up 7am to 420kW, peaks 2pm at 580kW, tapers down 8pm
        let diurnalFactor = 0.35; // base night
        if (hour >= 6 && hour < 9) diurnalFactor = 0.65; // morning ramp
        else if (hour >= 9 && hour < 17) diurnalFactor = 0.95; // peak work hours
        else if (hour >= 17 && hour < 21) diurnalFactor = 0.60; // evening ramp down

        if (isWeekend) {
          diurnalFactor *= 0.55; // weekend reduction
        }

        // Add temperature / weather seasonal noise
        const weatherNoise = (Math.sin(hour / 3.8) * 0.08);
        const randomJitter = (Math.random() * 0.05) - 0.025;
        const totalFactor = Math.max(0.25, diurnalFactor + weatherNoise + randomJitter);

        const buildingPower = Number((620.0 * totalFactor).toFixed(1));
        const deltaEnergy = Number((buildingPower * 2.0).toFixed(1)); // 2 hour interval
        cumulativeEnergy += deltaEnergy;

        // Insert main building reading
        insertReading.run(
          `rd-${readingId++}`, 'meter-01', bldg1Id, 'fl-b1', 'rm-b101',
          isoString, buildingPower, cumulativeEnergy, 401.2, Number((buildingPower * 1.45).toFixed(1)), 0.96
        );

        // Also insert sample floor-level readings for floor 1, 2, 3
        const fl1Power = Number((buildingPower * 0.16).toFixed(1));
        const fl2Power = Number((buildingPower * 0.22).toFixed(1));
        const fl3Power = Number((buildingPower * 0.28).toFixed(1));

        insertReading.run(`rd-${readingId++}`, 'meter-05', bldg1Id, 'fl-1', 'rm-101', isoString, fl1Power, fl1Power * 2, 400.0, fl1Power * 1.4, 0.95);
        insertReading.run(`rd-${readingId++}`, 'meter-06', bldg1Id, 'fl-2', 'rm-201', isoString, fl2Power, fl2Power * 2, 400.0, fl2Power * 1.4, 0.94);
        insertReading.run(`rd-${readingId++}`, 'meter-07', bldg1Id, 'fl-3', 'rm-301', isoString, fl3Power, fl3Power * 2, 400.0, fl3Power * 1.4, 0.95);
      }
    }
  });

  insertManyReadings();

  // 10. AI Anomalies with deep evidence and explanation
  const insertAnomaly = db.prepare(`
    INSERT INTO anomalies (id, meter_id, equipment_id, building_id, floor_id, severity, title, detected_at, measured_value, expected_value, difference_pct, confidence, explanation, evidence_json, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const anomaliesData = [
    {
      id: 'anom-01',
      meterId: 'meter-03',
      equipId: 'eq-003',
      floorId: 'fl-3',
      sev: 'high',
      title: 'HVAC-03 unusually high consumption',
      time: new Date(Date.now() - 42 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      measured: 42.8,
      expected: 27.4,
      diff: 56.2,
      conf: 94.0,
      expl: 'HVAC-03 consumed 42.8 kW during the last 30 minutes, approximately 56% above its normal operating range for this time and occupancy level.',
      evidence: JSON.stringify({
        historicalBaseline: '27.4 kW (+/- 1.8 kW normal variance)',
        occupancyFactor: '14 occupants in Zone 3 (expected cooling load < 28 kW)',
        ambientTemp: '22.8°C indoor setpoint vs 21.0°C actual outdoor',
        compressorStatus: 'Stage 2 compressor running at 100% capacity continuously without cycling',
        similarDaysComparison: 'Last 4 Tuesdays averaged 26.9 kW at 10:30 PM',
        timeline: [
          { time: '21:00', value: 26.5, expected: 26.0 },
          { time: '21:30', value: 27.2, expected: 26.4 },
          { time: '22:00', value: 38.1, expected: 26.8, note: 'Spike begins' },
          { time: '22:30', value: 42.8, expected: 27.4, note: 'Anomaly trigger limit exceeded' }
        ]
      }),
      status: 'active'
    },
    {
      id: 'anom-02',
      meterId: 'meter-07',
      equipId: 'eq-014',
      floorId: 'fl-2',
      sev: 'critical',
      title: 'Submeter Communication Abnormality & Drop',
      time: new Date(Date.now() - 110 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      measured: 0.0,
      expected: 32.5,
      diff: -100.0,
      conf: 98.0,
      expl: 'Submeter-07 ceased transmitting telemetry packets at 20:45. Telemetry heartbeat failed 3 consecutive polls.',
      evidence: JSON.stringify({
        historicalBaseline: '32.5 kW steady load from Floor 2 busway',
        lastPacket: 'RS-485 Modbus TCP Gateway packet timeout',
        adjacentPhase: 'Main feeder reports normal current on other branches',
        potentialCause: 'Breaker tripped or RS485 communication line disconnect',
        timeline: [
          { time: '20:15', value: 33.1, expected: 32.5 },
          { time: '20:30', value: 32.9, expected: 32.5 },
          { time: '20:45', value: 0.0, expected: 32.5, note: 'Signal dropped to zero' }
        ]
      }),
      status: 'active'
    },
    {
      id: 'anom-03',
      meterId: 'meter-10',
      equipId: 'eq-025',
      floorId: 'fl-3',
      sev: 'medium',
      title: 'Continuous overnight server baseline surge',
      time: new Date(Date.now() - 360 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      measured: 58.2,
      expected: 41.0,
      diff: 41.9,
      conf: 89.0,
      expl: 'Data Center PDU-A experienced an unseasonal 17.2 kW step increase during non-business hours without scheduled batch job flags.',
      evidence: JSON.stringify({
        historicalBaseline: '41.0 kW overnight steady state',
        workloadCorrelation: 'No scheduled ETL backup job recorded in facility CMMS',
        timeline: [
          { time: '01:00', value: 41.2, expected: 41.0 },
          { time: '02:00', value: 58.0, expected: 41.0, note: 'Step change detected' },
          { time: '03:00', value: 58.2, expected: 41.0 }
        ]
      }),
      status: 'investigating'
    },
    {
      id: 'anom-04',
      meterId: 'meter-15',
      equipId: 'eq-042',
      floorId: 'fl-1',
      sev: 'low',
      title: 'Lobby Architectural Lighting active outside curfew',
      time: new Date(Date.now() - 540 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      measured: 12.4,
      expected: 2.1,
      diff: 490.5,
      conf: 96.0,
      expl: 'Atrium aesthetic lighting arrays remained energized at 100% illumination past the 11 PM facility curfew.',
      evidence: JSON.stringify({
        historicalBaseline: '2.1 kW security emergency night lighting only',
        occupancy: '0 occupants registered in Level 1 lobby',
        curfewSchedule: 'Set to 20% dimming after 23:00'
      }),
      status: 'resolved'
    }
  ];

  for (const an of anomaliesData) {
    insertAnomaly.run(
      an.id, an.meterId, an.equipId, bldg1Id, an.floorId, an.sev,
      an.title, an.time, an.measured, an.expected, an.diff, an.conf,
      an.expl, an.evidence, an.status
    );
  }

  // 11. Energy Forecasts (Next 24h, 7d, 30d with confidence bounds)
  const insertForecast = db.prepare(`
    INSERT INTO forecasts (id, building_id, timestamp, predicted_value, lower_bound, upper_bound, confidence, peak_predicted, factors_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let fHour = 1; fHour <= 48; fHour++) {
    const fTime = new Date(now.getTime() + (fHour * 3600000));
    const h = fTime.getHours();
    const isWk = fTime.getDay() === 0 || fTime.getDay() === 6;

    let predicted = 220 + (Math.sin((h - 6) / 3.8) * 260);
    if (h < 6 || h > 21) predicted = 180 + Math.random() * 20;
    if (isWk) predicted *= 0.6;

    const lower = Number((predicted * 0.91).toFixed(1));
    const upper = Number((predicted * 1.09).toFixed(1));
    const conf = Number((93.5 - (fHour * 0.15)).toFixed(1)); // decreases slightly further in time

    insertForecast.run(
      `fc-${fHour}`, bldg1Id, fTime.toISOString().replace('T', ' ').substring(0, 19),
      Number(predicted.toFixed(1)), lower, upper, conf, 648.0,
      JSON.stringify({
        weatherForecast: 'Sunny 24°C, humidity 48%',
        expectedOccupancy: isWk ? 35 : 480,
        historicalBaselineWeight: 0.65,
        dayOfWeek: fTime.toLocaleDateString('en-US', { weekday: 'long' })
      })
    );
  }

  // 12. AI Efficiency Recommendations (Ground-truth evidence based)
  const insertRec = db.prepare(`
    INSERT INTO recommendations (id, building_id, title, description, potential_saving_pct, monthly_saving_usd, confidence, evidence_json, priority, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const recommendationsData = [
    {
      id: 'rec-01',
      title: 'Optimize Floor 3 HVAC schedule & setbacks',
      desc: 'Reduce HVAC operation in Floor 3 after 8 PM and align setback temperatures with measured occupancy trends.',
      savingPct: 11.4,
      monthlyUsd: 1240.0,
      conf: 91.0,
      priority: 'high',
      status: 'active',
      evidence: JSON.stringify([
        'Floor 3 consumes 18.4% of total building energy after 8 PM.',
        'Occupancy drops by 63% by 19:45, yet chillers run at full duty for an additional 2.3 hours.',
        'Similar floors (e.g. Floor 2) consume approximately 31% less during this matching window.',
        'Thermostat setback from 21.5°C to 24.5°C between 20:00 and 06:00 yields $14,880 annualized utility savings.'
      ])
    },
    {
      id: 'rec-02',
      title: 'Pre-cool building thermal mass during off-peak tariff',
      desc: 'Shift 80 kW of chiller cooling load from peak tariff (2:00 PM - 5:00 PM) to morning off-peak window (6:00 AM - 9:00 AM).',
      savingPct: 7.8,
      monthlyUsd: 890.0,
      conf: 88.0,
      priority: 'medium',
      status: 'active',
      evidence: JSON.stringify([
        'Current peak demand charge rate is $14.50/kW vs base $6.20/kW.',
        'Thermal storage capacity in building concrete envelope retains cooling for 3.2 hours.',
        'Avoids pushing peak demand over the 650 kW utility penalty threshold.'
      ])
    },
    {
      id: 'rec-03',
      title: 'Implement Daylight Harvesting in Grand Atrium',
      desc: 'Dim atrium perimeter lighting circuits to 30% when outdoor solar lux exceeds 45,000 lumens.',
      savingPct: 4.2,
      monthlyUsd: 460.0,
      conf: 95.0,
      priority: 'low',
      status: 'task_created',
      evidence: JSON.stringify([
        'South-facing glass curtain wall provides natural illumination of > 600 lux across 4,200 sq ft.',
        'Current fixtures consume 12.4 kW continuously between 10:00 AM and 3:00 PM regardless of sunlight.',
        'Payback period on smart photosensors is estimated under 4.1 months.'
      ])
    },
    {
      id: 'rec-04',
      title: 'Re-balance Tier-3 Data Center CRAC unit airflow',
      desc: 'Eliminate cold aisle bypass air mixing by installing blanking panels on racks R04-R09.',
      savingPct: 9.6,
      monthlyUsd: 1150.0,
      conf: 93.0,
      priority: 'high',
      status: 'implemented',
      evidence: JSON.stringify([
        'Delta T across CRAC units is currently only 6.2°C (industry target > 11°C).',
        'Fans currently operating at 85% RPM to compensate for recirculation.',
        'Improves Server Room PUE from 1.58 to 1.34.'
      ])
    }
  ];

  for (const r of recommendationsData) {
    insertRec.run(r.id, bldg1Id, r.title, r.desc, r.savingPct, r.monthlyUsd, r.conf, r.evidence, r.priority, r.status);
  }

  // 13. Alerts
  const insertAlert = db.prepare(`
    INSERT INTO alerts (id, tenant_id, building_id, type, severity, title, message, location, current_value, threshold, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const alertsData = [
    {
      id: 'alt-01',
      tenantId: tenant1Id,
      bldgId: bldg1Id,
      type: 'high_consumption',
      severity: 'critical',
      title: 'Peak Demand Limit Approaching Threshold',
      msg: 'Total building draw reached 621 kW (Threshold: 650 kW). Surcharge risk imminent.',
      loc: 'Main Incomer Feeder',
      curr: 621.0,
      thresh: 650.0,
      status: 'new',
      time: new Date(Date.now() - 15 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
    },
    {
      id: 'alt-02',
      tenantId: tenant1Id,
      bldgId: bldg1Id,
      type: 'equipment_failure',
      severity: 'critical',
      title: 'Chiller-02 Compressor High Head Pressure',
      msg: 'Chiller-02 operating safety trip triggered due to condenser flow drop.',
      loc: 'Level B1 Central Utility Plant',
      curr: 95.0,
      thresh: 80.0,
      status: 'new',
      time: new Date(Date.now() - 40 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
    },
    {
      id: 'alt-03',
      tenantId: tenant1Id,
      bldgId: bldg1Id,
      type: 'meter_offline',
      severity: 'warning',
      title: 'Smart Submeter 07 Offline',
      msg: 'Telemetry disconnected for Floor 2 Distribution feeder.',
      loc: 'Floor 2 Electrical Closet',
      curr: 0.0,
      thresh: 1.0,
      status: 'new',
      time: new Date(Date.now() - 95 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
    },
    {
      id: 'alt-04',
      tenantId: tenant1Id,
      bldgId: bldg1Id,
      type: 'anomaly_detected',
      severity: 'warning',
      title: 'AI Anomaly: HVAC-03 Continuous Run',
      msg: 'HVAC-03 drawing 42.8 kW (56% above baseline). Review recommended.',
      loc: 'Level 3 Engineering Bay',
      curr: 42.8,
      thresh: 27.4,
      status: 'acknowledged',
      time: new Date(Date.now() - 120 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
    },
    {
      id: 'alt-05',
      tenantId: tenant1Id,
      bldgId: bldg1Id,
      type: 'target_exceeded',
      severity: 'info',
      title: 'Daily Floor 3 Energy Target Exceeded by 8%',
      msg: 'Cumulative floor consumption exceeded daily allocated budget.',
      loc: 'Level 3 - Engineering & Tech Labs',
      curr: 734.0,
      thresh: 680.0,
      status: 'acknowledged',
      time: new Date(Date.now() - 280 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
    },
    {
      id: 'alt-06',
      tenantId: tenant1Id,
      bldgId: bldg1Id,
      type: 'forecast_peak',
      severity: 'info',
      title: 'Forecasted Peak Demand Warning for Tomorrow 2:30 PM',
      msg: 'AI model projects peak load of 648 kW during heat wave.',
      loc: 'Building Wide',
      curr: 648.0,
      thresh: 620.0,
      status: 'resolved',
      time: new Date(Date.now() - 500 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
    },
    {
      id: 'alt-07',
      tenantId: tenant1Id,
      bldgId: bldg1Id,
      type: 'high_consumption',
      severity: 'warning',
      title: 'Server Room Airway Temperature Creep',
      msg: 'Rack intake air temperature reached 25.1°C (target 21.5°C).',
      loc: 'Level 3 Tier-3 Data Center',
      curr: 25.1,
      thresh: 23.0,
      status: 'resolved',
      time: new Date(Date.now() - 720 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
    }
  ];

  for (const al of alertsData) {
    insertAlert.run(
      al.id, al.tenantId, al.bldgId, al.type, al.severity,
      al.title, al.msg, al.loc, al.curr, al.thresh, al.status, al.time
    );
  }

  // 14. Reports
  const insertReport = db.prepare(`
    INSERT INTO reports (id, tenant_id, building_id, type, title, period, file_format, data_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertReport.run('rep-01', tenant1Id, bldg1Id, 'Daily Energy Report', 'EnergyTwin Tower Daily Summary', 'Yesterday', 'PDF', JSON.stringify({ totalKwh: 3842, costUsd: 614.72, peakKw: 621, carbonTons: 1.61 }));
  insertReport.run('rep-02', tenant1Id, bldg1Id, 'Monthly Energy Report', 'September 2026 Monthly Audit', 'September 2026', 'PDF', JSON.stringify({ totalKwh: 112400, costUsd: 17984.0, peakKw: 635, efficiencyScore: 84 }));
  insertReport.run('rep-03', tenant1Id, bldg1Id, 'Equipment Efficiency Report', 'Chiller & HVAC Fleet Performance Analysis', 'Q3 2026', 'Excel', JSON.stringify({ inspectedUnits: 120, avgCop: 4.2, flaggedUnits: 4 }));
  insertReport.run('rep-04', tenant1Id, bldg1Id, 'Anomaly Report', 'Incident & Anomaly Summary Log', 'Last 30 Days', 'CSV', JSON.stringify({ anomaliesDetected: 14, estimatedWasteUsd: 1820 }));

  // 15. Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, tenant_id, user_id, user_name, action, resource, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run('aud-01', tenant1Id, 'usr-admin-01', 'Sarah Jenkins', 'SYSTEM_UPDATE', 'Energy Targets', 'Updated building daily target threshold to 4,200 kWh');
  insertAudit.run('aud-02', tenant1Id, 'usr-facility-01', 'David Miller', 'ALERT_ACKNOWLEDGE', 'Alert alt-04', 'Acknowledged HVAC-03 high consumption alert');
  insertAudit.run('aud-03', tenant1Id, 'usr-energy-01', 'Elena Rostova', 'RECOMMENDATION_STATUS', 'Recommendation rec-04', 'Marked Data Center CRAC re-balancing as Implemented');
  insertAudit.run('aud-04', tenant1Id, 'usr-admin-01', 'Sarah Jenkins', 'SIMULATOR_TEST', 'Telemetry Engine', 'Triggered automated spike test on Level 3 feeder');

  // 16. System Settings
  db.prepare(`
    INSERT INTO system_settings (id, tenant_id, cost_per_kwh, carbon_factor, peak_demand_threshold, daily_target_kwh, email_alerts, in_app_alerts, simulator_speed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('sett-tenant-01', tenant1Id, 0.16, 0.42, 650.0, 4200.0, 1, 1, 1.0);

  console.log('Seeding completed successfully!');
  console.log(`- 1 Organization, 2 Tenants`);
  console.log(`- 4 Demo Users (Super Admin, Facility Manager, Energy Manager, Tenant)`);
  console.log(`- 2 Buildings (EnergyTwin Tower: 6 Floors, 48 Rooms, 120 Equipment, 24 Meters)`);
  console.log(`- 30 Days of realistic energy readings`);
  console.log(`- 4 AI Anomalies with complete evidence timelines`);
  console.log(`- 48 Forecast points with confidence boundaries`);
  console.log(`- 4 Evidence-backed AI Efficiency Recommendations`);
  console.log(`- 7 Operational Alerts`);
}

// If run directly via command line
if (require.main === module) {
  runSeed();
}
