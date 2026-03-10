import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { users as User } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// ============ GROUPS ============

// List groups the user belongs to
router.get('/groups', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const memberships = await prisma.groupmembers.findMany({
    where: { user_id: user.id },
    include: {
      groups: {
        include: { _count: { select: { groupmembers: true } } },
      },
    },
  });
  res.json(
    memberships.map((m) => ({
      id: m.groups.id,
      name: m.groups.name,
      description: m.groups.description,
      owner_id: m.groups.owner_id,
      role: m.role,
      members_count: m.groups._count.groupmembers,
    }))
  );
});

// Get group details with members (must be a member)
router.get('/group/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);

  const membership = await prisma.groupmembers.findUnique({
    where: { user_id_group_id: { user_id: user.id, group_id: groupId } },
  });
  if (!membership) {
    res.status(403).json({ error: 'Not a member of this group' });
    return;
  }

  const group = await prisma.groups.findUnique({
    where: { id: groupId },
    include: {
      groupmembers: {
        include: { users: { select: { id: true, email: true } } },
      },
    },
  });
  if (!group) {
    res.status(404).json({ error: 'Group not found' });
    return;
  }

  res.json({
    id: group.id,
    name: group.name,
    description: group.description,
    owner_id: group.owner_id,
    members: group.groupmembers.map((m) => ({
      user_id: m.user_id,
      email: m.users.email,
      role: m.role,
    })),
  });
});

// Create a group
router.post('/group', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const existing = await prisma.groups.findUnique({ where: { name } });
  if (existing) {
    res.status(409).json({ error: 'Group name already taken' });
    return;
  }

  const group = await prisma.groups.create({
    data: { name, description, owner_id: user.id },
  });
  await prisma.groupmembers.create({
    data: { user_id: user.id, group_id: group.id, role: 'owner' },
  });

  res.status(201).json({ id: group.id, name: group.name, description: group.description });
});

// Update group name/description (owner only)
router.put('/group/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);

  const group = await prisma.groups.findUnique({ where: { id: groupId } });
  if (!group) {
    res.status(404).json({ error: 'Group not found' });
    return;
  }
  if (group.owner_id !== user.id) {
    res.status(403).json({ error: 'Only the owner can update this group' });
    return;
  }

  const { name, description } = req.body;
  const updated = await prisma.groups.update({
    where: { id: groupId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
    },
  });
  res.json({ id: updated.id, name: updated.name, description: updated.description });
});

// Delete group (owner only)
router.delete('/group/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);

  const group = await prisma.groups.findUnique({ where: { id: groupId } });
  if (!group) {
    res.status(404).json({ error: 'Group not found' });
    return;
  }
  if (group.owner_id !== user.id) {
    res.status(403).json({ error: 'Only the owner can delete this group' });
    return;
  }

  await prisma.groups.delete({ where: { id: groupId } });
  res.json({ success: true });
});

// Add a member by email (owner or admin)
router.post('/group/:id/member', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);

  const callerMembership = await prisma.groupmembers.findUnique({
    where: { user_id_group_id: { user_id: user.id, group_id: groupId } },
  });
  if (!callerMembership || !['owner', 'admin'].includes(callerMembership.role ?? '')) {
    res.status(403).json({ error: 'Only owners and admins can add members' });
    return;
  }

  const { email, role = 'member' } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  if (role === 'owner') {
    res.status(400).json({ error: 'Cannot assign owner role' });
    return;
  }

  const target = await prisma.users.findUnique({ where: { email } });
  if (!target) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const existing = await prisma.groupmembers.findUnique({
    where: { user_id_group_id: { user_id: target.id, group_id: groupId } },
  });
  if (existing) {
    res.status(409).json({ error: 'User is already a member' });
    return;
  }

  await prisma.groupmembers.create({
    data: { user_id: target.id, group_id: groupId, role },
  });
  res.status(201).json({ user_id: target.id, email: target.email, role });
});

// Remove a member (owner/admin, or the member themselves leaving)
router.delete('/group/:id/member/:userId', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);
  const targetUserId = parseInt(req.params.userId);
  const isSelf = user.id === targetUserId;

  if (!isSelf) {
    const callerMembership = await prisma.groupmembers.findUnique({
      where: { user_id_group_id: { user_id: user.id, group_id: groupId } },
    });
    if (!callerMembership || !['owner', 'admin'].includes(callerMembership.role ?? '')) {
      res.status(403).json({ error: 'Only owners and admins can remove members' });
      return;
    }
  }

  const targetMembership = await prisma.groupmembers.findUnique({
    where: { user_id_group_id: { user_id: targetUserId, group_id: groupId } },
  });
  if (!targetMembership) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }
  if (targetMembership.role === 'owner') {
    res.status(400).json({ error: 'Cannot remove the owner' });
    return;
  }

  await prisma.groupmembers.delete({
    where: { user_id_group_id: { user_id: targetUserId, group_id: groupId } },
  });
  res.json({ success: true });
});

// Update member role (owner only)
router.put('/group/:id/member/:userId', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);
  const targetUserId = parseInt(req.params.userId);

  const group = await prisma.groups.findUnique({ where: { id: groupId } });
  if (!group || group.owner_id !== user.id) {
    res.status(403).json({ error: 'Only the owner can change roles' });
    return;
  }

  const { role } = req.body;
  if (!role || role === 'owner') {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }

  const membership = await prisma.groupmembers.findUnique({
    where: { user_id_group_id: { user_id: targetUserId, group_id: groupId } },
  });
  if (!membership || membership.role === 'owner') {
    res.status(404).json({ error: 'Member not found or cannot change owner role' });
    return;
  }

  const updated = await prisma.groupmembers.update({
    where: { user_id_group_id: { user_id: targetUserId, group_id: groupId } },
    data: { role },
  });
  res.json({ user_id: updated.user_id, role: updated.role });
});

export default router;
