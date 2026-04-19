"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const status_1 = require("../utils/status");
const router = (0, express_1.Router)();
const createFieldSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    cropType: zod_1.z.string().min(1),
    plantingDate: zod_1.z.string(),
    location: zod_1.z.string().optional(),
    size: zod_1.z.number().positive().optional(),
    agentId: zod_1.z.string().uuid().optional()
});
const updateFieldSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    cropType: zod_1.z.string().min(1).optional(),
    location: zod_1.z.string().optional(),
    size: zod_1.z.number().positive().optional(),
    agentId: zod_1.z.string().uuid().optional().nullable()
});
const fieldUpdateSchema = zod_1.z.object({
    stage: zod_1.z.enum(['PLANTED', 'GROWING', 'READY', 'HARVESTED']),
    notes: zod_1.z.string().optional()
});
// Get all fields (admin sees all, agent sees assigned)
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const where = req.user?.role === 'ADMIN' ? {} : { agentId: req.user?.id };
        const fields = await db_1.prisma.field.findMany({
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
            status: (0, status_1.computeFieldStatus)(field.stage, field.plantingDate)
        }));
        res.json(fieldsWithStatus);
    }
    catch (error) {
        console.error('Get fields error:', error);
        res.status(500).json({ error: 'Failed to fetch fields' });
    }
});
// Get field by ID
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const field = await db_1.prisma.field.findUnique({
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
            status: (0, status_1.computeFieldStatus)(field.stage, field.plantingDate)
        });
    }
    catch (error) {
        console.error('Get field error:', error);
        res.status(500).json({ error: 'Failed to fetch field' });
    }
});
// Create field (admin only)
router.post('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const data = createFieldSchema.parse(req.body);
        const field = await db_1.prisma.field.create({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Create field error:', error);
        res.status(500).json({ error: 'Failed to create field' });
    }
});
// Update field (admin only)
router.patch('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const data = updateFieldSchema.parse(req.body);
        const field = await db_1.prisma.field.update({
            where: { id: req.params.id },
            data,
            include: {
                agent: { select: { id: true, name: true, email: true } }
            }
        });
        res.json(field);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Update field error:', error);
        res.status(500).json({ error: 'Failed to update field' });
    }
});
// Delete field (admin only)
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        await db_1.prisma.field.delete({ where: { id: req.params.id } });
        res.json({ message: 'Field deleted successfully' });
    }
    catch (error) {
        console.error('Delete field error:', error);
        res.status(500).json({ error: 'Failed to delete field' });
    }
});
// Add field update (agents for their fields, admin for any)
router.post('/:id/updates', auth_1.authenticate, async (req, res) => {
    try {
        const { stage, notes } = fieldUpdateSchema.parse(req.body);
        const field = await db_1.prisma.field.findUnique({
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
        const [update] = await db_1.prisma.$transaction([
            db_1.prisma.fieldUpdate.create({
                data: {
                    fieldId: req.params.id,
                    agentId: req.user.id,
                    stage: stage,
                    notes
                }
            }),
            db_1.prisma.field.update({
                where: { id: req.params.id },
                data: { stage: stage }
            })
        ]);
        res.status(201).json(update);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Create update error:', error);
        res.status(500).json({ error: 'Failed to create update' });
    }
});
// Get dashboard stats
router.get('/stats/dashboard', auth_1.authenticate, async (req, res) => {
    try {
        const where = req.user?.role === 'ADMIN' ? {} : { agentId: req.user?.id };
        const [totalFields, fields] = await Promise.all([
            db_1.prisma.field.count({ where }),
            db_1.prisma.field.findMany({ where })
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
            const status = (0, status_1.computeFieldStatus)(field.stage, field.plantingDate);
            if (status === 'ACTIVE')
                statusBreakdown.active++;
            else if (status === 'AT_RISK')
                statusBreakdown.atRisk++;
            else if (status === 'COMPLETED')
                statusBreakdown.completed++;
            stageBreakdown[field.stage.toLowerCase()]++;
        });
        // Recent updates
        const recentUpdates = await db_1.prisma.fieldUpdate.findMany({
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
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});
exports.default = router;
//# sourceMappingURL=fields.js.map