import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // Only admins can get all users
    if (session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            patients: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match frontend expectations
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      is_active: user.isActive,
      created_at: user.createdAt,
      patient_count: user._count.patients
    }));

    return res.status(200).json(transformedUsers);

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Database operation failed'
    });
  } finally {
    await prisma.$disconnect();
  }
}
