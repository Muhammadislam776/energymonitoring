import { Router, Response } from 'express';
import { db } from '../db/database';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/forecasts
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { buildingId, range = '24h' } = req.query;
  const bldgId = (buildingId as string) || 'bldg-ettower-01';

  // 1. Get historical measured data for the chart leading up to now (last 24 hours)
  const historical = db.prepare(`
    SELECT strftime('%Y-%m-%d %H:00', timestamp) as time_label,
           strftime('%H:00', timestamp) as hour_label,
           ROUND(power, 1) as actual_kw,
           'measured' as type
    FROM energy_readings
    WHERE building_id = ? AND timestamp >= datetime('now', '-24 hours')
    ORDER BY timestamp ASC
  `).all(bldgId) as any[];

  // 2. Get forecasted data
  const forecastLimit = range === '24h' ? 24 : range === '7d' ? 48 : 48;
  const forecasts = db.prepare(`
    SELECT strftime('%Y-%m-%d %H:00', timestamp) as time_label,
           strftime('%H:00', timestamp) as hour_label,
           predicted_value,
           lower_bound,
           upper_bound,
           confidence,
           peak_predicted,
           factors_json
    FROM forecasts
    WHERE building_id = ?
    ORDER BY timestamp ASC
    LIMIT ?
  `).all(bldgId, forecastLimit) as any[];

  // 3. Format unified chart series
  // Historical items have actual_kw, forecast items have predicted_value, lower_bound, upper_bound
  const chartSeries: any[] = [];

  historical.forEach(h => {
    chartSeries.push({
      time: h.hour_label || h.time_label,
      fullTime: h.time_label,
      actualKw: h.actual_kw,
      predictedKw: null,
      lowerBound: null,
      upperBound: null,
      isForecast: false
    });
  });

  forecasts.forEach(f => {
    chartSeries.push({
      time: f.hour_label || f.time_label,
      fullTime: f.time_label,
      actualKw: null,
      predictedKw: f.predicted_value,
      lowerBound: f.lower_bound,
      upperBound: f.upper_bound,
      isForecast: true
    });
  });

  return res.json({
    kpis: {
      predictedTomorrowKwh: 4120,
      expectedPeakKw: 648.0,
      expectedPeakTime: '2:30 PM',
      forecastConfidence: 92.4,
      modelType: 'Hybrid LSTM + XGBoost Ensemble'
    },
    contributingFactors: [
      { name: 'Historical Consumption Profile', weight: 42, impact: 'High (+)', desc: 'Weighted average of last 4 weeks of baseline load' },
      { name: 'Diurnal Occupancy Forecast', weight: 26, impact: 'High (+)', desc: 'Calendar bookings indicate 92% occupancy tomorrow' },
      { name: 'Ambient Weather Prediction', weight: 18, impact: 'Medium (+)', desc: 'Projected max temp 28°C increases chiller demand' },
      { name: 'Equipment Scheduled Cycles', weight: 14, impact: 'Low (-)', desc: 'Pre-cooling cycle scheduled between 06:00 - 08:30 AM' }
    ],
    chartSeries
  });
});

export default router;
