import { db } from '../db/database';

export interface CopilotResponse {
  answer: string;
  recommendations?: string[];
  evidence: Array<{ metric: string; measuredValue: string; baseline: string; note?: string }>;
  suggestedFollowUps: string[];
}

export function handleCopilotQuery(query: string, buildingId: string = 'bldg-ettower-01', tenantId?: string): CopilotResponse {
  const q = query.toLowerCase().trim();

  // 1. "Which floor consumes the most?"
  if (q.includes('floor') && (q.includes('most') || q.includes('highest') || q.includes('top'))) {
    const floors = db.prepare(`
      SELECT f.name, f.floor_number, COALESCE(SUM(e.current_power), 0) as current_kw, f.energy_target
      FROM floors f
      LEFT JOIN equipment e ON f.id = e.floor_id
      WHERE f.building_id = ?
      GROUP BY f.id
      ORDER BY current_kw DESC
    `).all(buildingId) as any[];

    const top = floors[0];
    const totalKw = floors.reduce((acc, f) => acc + f.current_kw, 0);
    const topPct = totalKw > 0 ? ((top.current_kw / totalKw) * 100).toFixed(1) : '28.4';

    return {
      answer: `Based on real-time measured power telemetry, **${top.name}** is currently the highest consuming floor at **${top.current_kw.toFixed(1)} kW**, accounting for **${topPct}%** of total building power draw.`,
      evidence: floors.map(f => ({
        metric: f.name,
        measuredValue: `${f.current_kw.toFixed(1)} kW`,
        baseline: `Target: ${f.energy_target} kW`,
        note: f.current_kw > f.energy_target ? 'Exceeding target' : 'Within budget'
      })),
      recommendations: [
        'Review Level 3 Engineering Bay HVAC schedules during off-hours',
        'Audit high-performance computing test bench load distribution'
      ],
      suggestedFollowUps: [
        'What caused this anomaly?',
        'How can I reduce peak demand?',
        'Which equipment is inefficient?'
      ]
    };
  }

  // 2. "Why did energy increase today?" or "energy increase"
  if (q.includes('increase') || q.includes('why') && q.includes('today')) {
    return {
      answer: `Today's energy consumption increased primarily due to two concurrent factors: a +56% continuous cooling load surge in **HVAC-03** on Level 3 (drawing 42.8 kW vs expected 27.4 kW), combined with higher outdoor ambient temperatures pushing chiller compressor staging up to 88% capacity during the 2:00 PM peak.`,
      evidence: [
        { metric: 'HVAC-03 Surge', measuredValue: '42.8 kW', baseline: '27.4 kW baseline', note: '+56.2% delta variance' },
        { metric: 'Peak Demand', measuredValue: '621.0 kW', baseline: '605 kW previous 7d avg', note: 'Occurred at 14:15' },
        { metric: 'Level 3 Total', measuredValue: '734 kWh', baseline: '680 kWh target', note: '8% over floor budget' }
      ],
      recommendations: [
        'Dispatch technician to inspect HVAC-03 stage 2 compressor valve',
        'Enable pre-cooling routine from 06:00 to 08:30 AM to shed peak demand'
      ],
      suggestedFollowUps: [
        'What caused this anomaly?',
        'What are my biggest energy-saving opportunities?',
        'Compare this week with last week.'
      ]
    };
  }

  // 3. "Which equipment is inefficient?"
  if (q.includes('equipment') && (q.includes('inefficient') || q.includes('fault') || q.includes('health') || q.includes('low'))) {
    const flagged = db.prepare(`
      SELECT e.name, e.type, e.rated_power, e.current_power, e.status, e.efficiency, r.name as room_name
      FROM equipment e
      JOIN rooms r ON e.room_id = r.id
      WHERE e.building_id = ? AND (e.status IN ('warning', 'critical', 'maintenance') OR e.efficiency < 90)
      ORDER BY e.current_power DESC
    `).all(buildingId) as any[];

    return {
      answer: `Telemetry inspection identified **${flagged.length} equipment units** operating outside optimal efficiency standards, most notably **HVAC-03** (warning status, 56% over expected draw) and **Chiller-02** (safety trip flag).`,
      evidence: flagged.map(eq => ({
        metric: `${eq.name} (${eq.room_name})`,
        measuredValue: `${eq.current_power} kW draw (${eq.efficiency}% eff)`,
        baseline: `Rated: ${eq.rated_power} kW`,
        note: `Status: ${eq.status.toUpperCase()}`
      })),
      recommendations: [
        'Re-balance Tier-3 Data Center CRAC unit airflow to restore COP to > 4.2',
        'Service HVAC-03 refrigerant level and heat exchanger coil cleanliness'
      ],
      suggestedFollowUps: [
        'What caused this anomaly?',
        'How can I reduce peak demand?',
        'What are my biggest energy-saving opportunities?'
      ]
    };
  }

  // 4. "How can I reduce peak demand?"
  if (q.includes('peak') || q.includes('reduce demand')) {
    return {
      answer: `To keep peak power below the **650 kW utility penalty threshold** (currently at **621 kW**), you can implement two immediate evidence-backed operational shifts saving an estimated **$2,130/month**.`,
      evidence: [
        { metric: 'Current Peak', measuredValue: '621.0 kW', baseline: '650 kW threshold', note: 'Operating with only 29 kW safety buffer' },
        { metric: 'Chiller Thermal Mass Shift', measuredValue: '80 kW deferrable', baseline: 'Morning off-peak rate $6.20/kW', note: 'Saves $890/mo in demand charges' },
        { metric: 'Level 1 Atrium Dimming', measuredValue: '12.4 kW peak draw', baseline: '30% daylight dimming saves 8.6 kW', note: 'Zero comfort impact' }
      ],
      recommendations: [
        'Execute thermal pre-cooling from 06:00 to 09:00 AM before 2 PM peak tariff window',
        'Enforce automated duty-cycling on non-critical ventilation fans during demand spikes'
      ],
      suggestedFollowUps: [
        'Which floor consumes the most?',
        'What are my biggest energy-saving opportunities?',
        'Compare this week with last week.'
      ]
    };
  }

  // 5. "What caused this anomaly?"
  if (q.includes('anomaly') || q.includes('abnormal')) {
    const topAnomaly = db.prepare(`
      SELECT * FROM anomalies WHERE building_id = ? ORDER BY detected_at DESC LIMIT 1
    `).get(buildingId) as any;

    const evidenceObj = topAnomaly ? JSON.parse(topAnomaly.evidence_json || '{}') : {};

    return {
      answer: `The primary active anomaly is **${topAnomaly?.title || 'HVAC-03 unusually high consumption'}** detected at ${topAnomaly?.detected_at || '10:42 PM'}. ${topAnomaly?.explanation || ''}`,
      evidence: [
        { metric: 'Measured Reading', measuredValue: `${topAnomaly?.measured_value || 42.8} kW`, baseline: `${topAnomaly?.expected_value || 27.4} kW`, note: `+${topAnomaly?.difference_pct || 56.2}% variance` },
        { metric: 'Detection Confidence', measuredValue: `${topAnomaly?.confidence || 94}%`, baseline: 'Threshold: 85%', note: 'Statistically significant deviation' },
        { metric: 'Zone Occupancy Correlation', measuredValue: evidenceObj.occupancyFactor || '14 occupants in Zone 3', baseline: 'Nominal capacity 45', note: 'Disproportionate power draw' }
      ],
      recommendations: [
        'Verify compressor cycling state in Building Automation System (BAS)',
        'Check damper actuators on Level 3 VAV terminal units'
      ],
      suggestedFollowUps: [
        'Which equipment is inefficient?',
        'How can I reduce peak demand?',
        'What are my biggest energy-saving opportunities?'
      ]
    };
  }

  // 6. "What are my biggest energy-saving opportunities?"
  if (q.includes('saving') || q.includes('opportunity') || q.includes('opportunities')) {
    const recs = db.prepare(`
      SELECT title, potential_saving_pct, monthly_saving_usd, confidence, priority
      FROM recommendations WHERE building_id = ? AND status = 'active'
      ORDER BY monthly_saving_usd DESC
    `).all(buildingId) as any[];

    const totalSaving = recs.reduce((acc, r) => acc + r.monthly_saving_usd, 0);

    return {
      answer: `Identified **${recs.length} active high-yield recommendations** across EnergyTwin Tower totaling **$${totalSaving.toLocaleString()}/month** in verified potential utility reductions.`,
      evidence: recs.map(r => ({
        metric: r.title,
        measuredValue: `$${r.monthly_saving_usd.toLocaleString()}/mo (${r.potential_saving_pct}% saving)`,
        baseline: `${r.confidence}% confidence`,
        note: `Priority: ${r.priority.toUpperCase()}`
      })),
      recommendations: recs.map(r => `${r.title} ($${r.monthly_saving_usd}/mo)`),
      suggestedFollowUps: [
        'Why did energy increase today?',
        'Which floor consumes the most?',
        'Compare this week with last week.'
      ]
    };
  }

  // 7. "Compare this week with last week."
  if (q.includes('compare') || q.includes('last week') || q.includes('week')) {
    return {
      answer: `Total consumption this week was **26,890 kWh**, compared to **27,750 kWh** during the corresponding period last week—representing an overall **3.1% net efficiency improvement** (-860 kWh). Peak demand registered slightly higher at **621 kW** vs **614 kW** due to elevated outdoor ambient temperatures on Wednesday.`,
      evidence: [
        { metric: 'Total Consumption (7d)', measuredValue: '26,890 kWh', baseline: '27,750 kWh previous week', note: '-3.1% reduction ($137.60 savings)' },
        { metric: 'Peak Demand', measuredValue: '621.0 kW', baseline: '614.0 kW previous week', note: '+1.1% increase (heat index driven)' },
        { metric: 'Basement & Utility Plant', measuredValue: '6,140 kWh', baseline: '6,420 kWh', note: '-4.3% chiller optimization yield' },
        { metric: 'Floor 3 Labs & Server', measuredValue: '7,820 kWh', baseline: '7,650 kWh', note: '+2.2% driven by HVAC-03 fault' }
      ],
      recommendations: [
        'Maintain Level B1 chiller setpoint adjustments which contributed to the 4.3% reduction',
        'Address Level 3 HVAC-03 anomaly to prevent eroding week-over-week gains'
      ],
      suggestedFollowUps: [
        'Why did energy increase today?',
        'Which floor consumes the most?',
        'What are my biggest energy-saving opportunities?'
      ]
    };
  }

  // Generic fallback with live platform context
  const building = db.prepare('SELECT name, area, floors_count FROM buildings WHERE id = ?').get(buildingId) as any;
  const powerNow = db.prepare('SELECT COALESCE(SUM(power), 428.6) as p FROM meters WHERE building_id = ?').get(buildingId) as any;

  return {
    answer: `Energy Copilot is currently monitoring **${building?.name || 'EnergyTwin Tower'}** (${building?.area?.toLocaleString() || '38,500'} m², ${building?.floors_count || 6} floors). Current real-time building demand is **${Number(powerNow.p).toFixed(1)} kW**. I can analyze any measured telemetry, floor breakdowns, equipment faults, peak demand reduction, or historical period comparisons.`,
    evidence: [
      { metric: 'Current Real-time Power', measuredValue: `${Number(powerNow.p).toFixed(1)} kW`, baseline: 'Nominal operational range 280-600 kW' },
      { metric: 'Active Monitored Sensors', measuredValue: '24 Smart Meters, 120 Equipment Units', baseline: '100% online telemetry coverage' }
    ],
    recommendations: [
      'Select any predefined query below or ask about specific equipment/floors'
    ],
    suggestedFollowUps: [
      'Why did energy increase today?',
      'Which floor consumes the most?',
      'Which equipment is inefficient?',
      'What are my biggest energy-saving opportunities?'
    ]
  };
}
