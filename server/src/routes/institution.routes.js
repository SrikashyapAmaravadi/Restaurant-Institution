import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken, requireRole, recordAuditLog } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/institutions
 * Fetch all institutions
 */
router.get('/', async (req, res) => {
  try {
    const institutions = await prisma.institution.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: institutions
    });
  } catch (err) {
    console.error('Error fetching institutions:', err);
    res.status(500).json({ success: false, error: 'Internal server error fetching institutions' });
  }
});

/**
 * GET /api/institutions/:id
 * Fetch single institution by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const institution = await prisma.institution.findUnique({
      where: { id }
    });

    if (!institution) {
      return res.status(404).json({ success: false, error: 'Institution not found' });
    }

    res.json({
      success: true,
      data: institution
    });
  } catch (err) {
    console.error('Error fetching institution details:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/institutions
 * Super Admin: Create new institution campus
 */
router.post('/', authenticateToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { name, domain, location, status = 'ACTIVE', isPrimary = false } = req.body;

    if (!name || !domain) {
      return res.status(400).json({ success: false, error: 'Campus name and student email domain are required' });
    }

    const existing = await prisma.institution.findUnique({ where: { domain } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'An institution with this domain already exists' });
    }

    const institution = await prisma.institution.create({
      data: {
        name,
        domain: domain.toLowerCase().trim(),
        location: location || 'Campus',
        status,
        isPrimary: Boolean(isPrimary)
      }
    });

    await recordAuditLog(req, {
      action: 'INSTITUTION_CREATED',
      entityType: 'INSTITUTION',
      entityId: institution.id,
      details: { name: institution.name, domain: institution.domain }
    });

    res.status(201).json({
      success: true,
      data: institution,
      message: 'Institution campus registered successfully'
    });
  } catch (err) {
    console.error('Error creating institution:', err);
    res.status(500).json({ success: false, error: 'Internal server error creating institution' });
  }
});

/**
 * PUT /api/institutions/:id
 * Super Admin: Update institution campus details
 */
router.put('/:id', authenticateToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, domain, location, status, isPrimary, partnerRestaurants } = req.body;

    const existing = await prisma.institution.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Institution not found' });
    }

    const updated = await prisma.institution.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(domain !== undefined && { domain: domain.toLowerCase().trim() }),
        ...(location !== undefined && { location }),
        ...(status !== undefined && { status }),
        ...(isPrimary !== undefined && { isPrimary: Boolean(isPrimary) }),
        ...(partnerRestaurants !== undefined && { partnerRestaurants: parseInt(partnerRestaurants, 10) })
      }
    });

    await recordAuditLog(req, {
      action: 'INSTITUTION_UPDATED',
      entityType: 'INSTITUTION',
      entityId: id,
      details: { changes: req.body }
    });

    res.json({
      success: true,
      data: updated,
      message: 'Institution updated successfully'
    });
  } catch (err) {
    console.error('Error updating institution:', err);
    res.status(500).json({ success: false, error: 'Internal server error updating institution' });
  }
});

/**
 * DELETE /api/institutions/:id
 * Super Admin: Delete or soft-deactivate an institution
 */
router.delete('/:id', authenticateToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.institution.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Institution not found' });
    }

    if (existing.isPrimary) {
      return res.status(400).json({ success: false, error: 'Cannot delete primary benchmark institution' });
    }

    await prisma.institution.delete({ where: { id } });

    await recordAuditLog(req, {
      action: 'INSTITUTION_DELETED',
      entityType: 'INSTITUTION',
      entityId: id,
      details: { name: existing.name, domain: existing.domain }
    });

    res.json({
      success: true,
      message: 'Institution removed successfully'
    });
  } catch (err) {
    console.error('Error deleting institution:', err);
    res.status(500).json({ success: false, error: 'Internal server error deleting institution' });
  }
});

export default router;
