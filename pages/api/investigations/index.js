import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const { patientId } = req.query;

        let investigations;
        if (patientId) {
          // Get investigations for specific patient
          investigations = await prisma.investigation.findMany({
            where: {
              patientId: patientId,
              patient: {
                userId: session.user.id
              }
            },
            include: {
              patient: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              date: 'desc'
            }
          });
        } else {
          // Get all investigations for user's patients
          investigations = await prisma.investigation.findMany({
            where: {
              patient: {
                userId: session.user.id
              }
            },
            include: {
              patient: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              date: 'desc'
            }
          });
        }

        return res.status(200).json(investigations);

      case 'POST':
        const { patientId: newPatientId, type, details, date, fileUrl } = req.body;

        // Validate required fields
        if (!newPatientId || !type || !details || !date) {
          return res.status(400).json({ 
            error: 'Missing required fields',
            details: 'patientId, type, details, and date are required'
          });
        }

        // Verify patient belongs to user
        const patient = await prisma.patient.findFirst({
          where: {
            id: newPatientId,
            userId: session.user.id
          }
        });

        if (!patient) {
          return res.status(404).json({ error: 'Patient not found' });
        }

        const newInvestigation = await prisma.investigation.create({
          data: {
            type,
            details,
            date: new Date(date),
            fileUrl: fileUrl || null,
            patientId: newPatientId
          },
          include: {
            patient: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        return res.status(201).json(newInvestigation);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
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
