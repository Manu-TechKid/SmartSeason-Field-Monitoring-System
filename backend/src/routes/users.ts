import { Router } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// Get all field agents (for admin to assign fields)
router.get('/agents', authenticate, requireAdmin, async (req, res) => {
  try {
    const agents = await prisma.user.findMany({
      where: { role: 'FIELD_AGENT' },
      select: { id: true, name: true, email: true }
    });
    res.json(agents);
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true }
    });
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
