import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { computeFieldStatus } from '../utils/status';

const router = Router();

const createFieldSchema = z.object({
  name: z.string().min(1),
  cropType: z.string().min(1),
  plantingDate: z.string().datetime(),
  location: z.string().optional(),
  size: z.number().positive().optional(),
  agentId: z.string().uuid().optional()
});

const updateFieldSchema = z.object({
  name: z.string().min(1).optional(),
  cropType: z.string().min(1).optional(),
  location: z.string().optional(),
  size: z.number().positive().optional(),
  agentId: z.string().uuid().optional().nullable()
});

const fieldUpdateSchema = z.object({
  stage: z.enum(['PLANTED', 'GROWING', 'READY', 'HARVESTED']),
  notes: z.string().optional()
});

// Get all fields (admin sees all, agent sees assigned)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const where = req.user?.role === 'ADMIN' ? {} : { agentId: req.user?.id };
    
    const fields = await prisma.field.findMany({
      where,
      include: {
        agent: { select: { id: true, name: true, email: true } },
        _count: { select: { updates: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    // Recompute status for each field
    const fieldsWithStatus = fields.map(field => ({
      ...field,
      status: computeFieldStatus(field.stage, field.plantingDate)
    }));
    
    res.json(fieldsWithStatus);
  } catch (error) {
    console.error('Get fields error:', error);
    res.status(500).json({ error: 'Failed to fetch fields' });
  }
});

// Get field by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const field = await prisma.field.findUnique({
      where: { id: req.params.id },
      include: {
        agent: { select: { id: true, name: true, email: true } },
        updates: {
          include: { agent: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }
    
    // Check access
    if (req.user?.role !== 'ADMIN' && field.agentId !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      ...field,
      status: computeFieldStatus(field.stage, field.plantingDate)
    });
  } catch (error) {
    console.error('Get field error:', error);
    res.status(500).json({ error: 'Failed to fetch field' });
  }
});

// Create field (admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = createFieldSchema.parse(req.body);
    
    const field = await prisma.field.create({
      data: {
        name: data.name,
        cropType: data.cropType,
        plantingDate: new Date(data.plantingDate),
        location: data.location,
        size: data.size,
        agentId: data.agentId,
        status: 'ACTIVE'
      },
      include: {
        agent: { select: { id: true, name: true, email: true } }
      }
    });
    
    res.status(201).json(field);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create field error:', error);
    res.status(500).json({ error: 'Failed to create field' });
  }
});

// Update field (admin only)
router.patch('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = updateFieldSchema.parse(req.body);
    
    const field = await prisma.field.update({
      where: { id: req.params.id },
      data,
      include: {
        agent: { select: { id: true, name: true, email: true } }
      }
    });
    
    res.json(field);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update field error:', error);
    res.status(500).json({ error: 'Failed to update field' });
  }
});

// Delete field (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    await prisma.field.delete({ where: { id: req.params.id } });
    res.json({ message: 'Field deleted successfully' });
  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({ error: 'Failed to delete field' });
  }
});

// Add field update (agents for their fields, admin for any)
router.post('/:id/updates', authenticate, async (req: AuthRequest, res) => {
  try {
    const { stage, notes } = fieldUpdateSchema.parse(req.body);
    
    const field = await prisma.field.findUnique({
      where: { id: req.params.id }
    });
    
    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }
    
    // Check access
    if (req.user?.role !== 'ADMIN' && field.agentId !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Create update and update field stage
    const [update] = await prisma.$transaction([
      prisma.fieldUpdate.create({
        data: {
          fieldId: req.params.id,
          agentId: req.user!.id,
          stage: stage,
          notes
        }
      }),
      prisma.field.update({
        where: { id: req.params.id },
        data: { stage: stage }
      })
    ]);
    
    res.status(201).json(update);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create update error:', error);
    res.status(500).json({ error: 'Failed to create update' });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', authenticate, async (req: AuthRequest, res) => {
  try {
    const where = req.user?.role === 'ADMIN' ? {} : { agentId: req.user?.id };
    
    const [totalFields, fields] = await Promise.all([
      prisma.field.count({ where }),
      prisma.field.findMany({ where })
    ]);
    
    // Compute status breakdown
    const statusBreakdown = {
      active: 0,
      atRisk: 0,
      completed: 0
    };
    
    const stageBreakdown = {
      planted: 0,
      growing: 0,
      ready: 0,
      harvested: 0
    };
    
    fields.forEach(field => {
      const status = computeFieldStatus(field.stage, field.plantingDate);
      if (status === 'ACTIVE') statusBreakdown.active++;
      else if (status === 'AT_RISK') statusBreakdown.atRisk++;
      else if (status === 'COMPLETED') statusBreakdown.completed++;
      
      stageBreakdown[field.stage.toLowerCase() as keyof typeof stageBreakdown]++;
    });
    
    // Recent updates
    const recentUpdates = await prisma.fieldUpdate.findMany({
      where: req.user?.role === 'ADMIN' ? {} : { agentId: req.user?.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        field: { select: { name: true, cropType: true } },
        agent: { select: { name: true } }
      }
    });
    
    res.json({
      totalFields,
      statusBreakdown,
      stageBreakdown,
      recentUpdates
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
