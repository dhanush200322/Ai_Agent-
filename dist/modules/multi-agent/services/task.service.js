"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TaskService {
    async createTask(teamId, input, priority = 0, parentTaskId) {
        return prisma.agentTask.create({
            data: {
                teamId,
                input,
                priority,
                parentTaskId,
                status: 'PENDING'
            }
        });
    }
    async assignTask(taskId, agentId) {
        return prisma.agentTask.update({
            where: { id: taskId },
            data: { assignedAgentId: agentId, status: 'WAITING' }
        });
    }
    async startTask(taskId) {
        return prisma.agentTask.update({
            where: { id: taskId },
            data: { status: 'RUNNING', startedAt: new Date() }
        });
    }
    async completeTask(taskId, output) {
        return prisma.agentTask.update({
            where: { id: taskId },
            data: { status: 'COMPLETED', output, completedAt: new Date() }
        });
    }
    async failTask(taskId, error) {
        return prisma.agentTask.update({
            where: { id: taskId },
            data: { status: 'FAILED', output: error, completedAt: new Date() }
        });
    }
    async getSubTasks(parentTaskId) {
        return prisma.agentTask.findMany({
            where: { parentTaskId },
            orderBy: { createdAt: 'asc' }
        });
    }
}
exports.TaskService = TaskService;
