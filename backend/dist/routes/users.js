"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// Get all field agents (for admin to assign fields)
router.get('/agents', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const agents = await db_1.prisma.user.findMany({
            where: { role: 'FIELD_AGENT' },
            select: { id: true, name: true, email: true }
        });
        res.json(agents);
    }
    catch (error) {
        console.error('Get agents error:', error);
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});
// Get current user profile
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, name: true, role: true }
        });
        res.json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map