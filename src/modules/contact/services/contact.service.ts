import { prisma } from '../../../shared/prisma';
import { AuditLogger } from '../../../shared/audit/auditLogger';

export class ContactService {
  
  async createSubmission(data: any, files: Express.Multer.File[] = []) {
    // Save submission and attachments in a transaction
    const submission = await prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        subject: data.subject,
        message: data.message,
        ipAddress: data.ipAddress,
        browser: data.browser,
        status: 'PENDING',
        attachments: {
          create: files.map((file) => ({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            fileSize: file.size,
            path: `/uploads/contact/${file.filename}`
          }))
        }
      },
      include: {
        attachments: true
      }
    });

    AuditLogger.log('CONTACT_SUBMISSION_CREATED', 'contact', { submissionId: submission.id });
    
    return submission;
  }

  async getSubmissions(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    
    const whereClause = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as any } },
        { email: { contains: search, mode: 'insensitive' as any } },
        { subject: { contains: search, mode: 'insensitive' as any } }
      ]
    } : {};

    const [total, items] = await Promise.all([
      prisma.contactSubmission.count({ where: whereClause }),
      prisma.contactSubmission.findMany({
        where: whereClause,
        include: { attachments: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      items
    };
  }

  async updateStatus(id: string, status: string) {
    const updated = await prisma.contactSubmission.update({
      where: { id },
      data: { status }
    });
    AuditLogger.log('CONTACT_SUBMISSION_UPDATED', 'contact', { submissionId: id, status });
    return updated;
  }

  async deleteSubmission(id: string) {
    await prisma.contactSubmission.delete({
      where: { id }
    });
    AuditLogger.log('CONTACT_SUBMISSION_DELETED', 'contact', { submissionId: id });
    return { success: true };
  }
}
