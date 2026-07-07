"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const prisma_1 = require("../../../shared/prisma");
const auditLogger_1 = require("../../../shared/audit/auditLogger");
class ContactService {
    async createSubmission(data, files = []) {
        // Save submission and attachments in a transaction
        const submission = await prisma_1.prisma.contactSubmission.create({
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
        auditLogger_1.AuditLogger.log('CONTACT_SUBMISSION_CREATED', 'contact', { submissionId: submission.id });
        return submission;
    }
    async getSubmissions(page, limit, search) {
        const skip = (page - 1) * limit;
        const whereClause = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } }
            ]
        } : {};
        const [total, items] = await Promise.all([
            prisma_1.prisma.contactSubmission.count({ where: whereClause }),
            prisma_1.prisma.contactSubmission.findMany({
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
    async updateStatus(id, status) {
        const updated = await prisma_1.prisma.contactSubmission.update({
            where: { id },
            data: { status }
        });
        auditLogger_1.AuditLogger.log('CONTACT_SUBMISSION_UPDATED', 'contact', { submissionId: id, status });
        return updated;
    }
    async deleteSubmission(id) {
        await prisma_1.prisma.contactSubmission.delete({
            where: { id }
        });
        auditLogger_1.AuditLogger.log('CONTACT_SUBMISSION_DELETED', 'contact', { submissionId: id });
        return { success: true };
    }
}
exports.ContactService = ContactService;
