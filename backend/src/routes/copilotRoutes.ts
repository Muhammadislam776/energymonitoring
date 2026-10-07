import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { handleCopilotQuery } from '../services/aiCopilotService';

const router = Router();

// POST /api/copilot/chat
router.post('/chat', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { message, buildingId } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message query is required' });
  }

  const bldgId = buildingId || 'bldg-ettower-01';
  const tenantId = req.user?.tenant_id || undefined;

  const result = handleCopilotQuery(message, bldgId, tenantId);

  return res.json({
    reply: result.answer,
    evidence: result.evidence,
    recommendations: result.recommendations,
    suggestedFollowUps: result.suggestedFollowUps,
    timestamp: new Date().toISOString()
  });
});

export default router;
