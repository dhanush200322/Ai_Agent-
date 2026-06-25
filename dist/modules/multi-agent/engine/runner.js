"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiAgentRunner = void 0;
const team_service_1 = require("../services/team.service");
const task_service_1 = require("../services/task.service");
const scheduler_service_1 = require("../services/scheduler.service");
const consensus_service_1 = require("../services/consensus.service");
const message_bus_service_1 = require("../services/message-bus.service");
const teamService = new team_service_1.TeamService();
const taskService = new task_service_1.TaskService();
const schedulerService = new scheduler_service_1.SchedulerService();
const consensusService = new consensus_service_1.ConsensusService();
const messageBusService = new message_bus_service_1.MessageBusService();
class MultiAgentRunner {
    /**
     * The entry point for multi-agent execution.
     */
    async run(teamId, objective) {
        const team = await teamService.getTeam(teamId);
        if (!team)
            throw new Error('Team not found');
        console.log(`[Runner] Initiating objective for Team: ${team.name}`);
        // 1. Create Parent Task
        const parentTask = await taskService.createTask(teamId, objective, 100);
        // 2. Manager Delegation (Mock: break into 3 subtasks)
        console.log(`[Runner] Manager decomposing objective into 3 subtasks...`);
        await taskService.createTask(teamId, `Research Phase`, 10, parentTask.id);
        await taskService.createTask(teamId, `Planning Phase`, 10, parentTask.id);
        await taskService.createTask(teamId, `Execution Phase`, 10, parentTask.id);
        // 3. Broadcast Team Kickoff Message
        await messageBusService.broadcast(team.createdById, // the user orchestrating
        teamId, `Starting Team Objective: ${objective}`, 'UPDATE', parentTask.id);
        // 4. Scheduler Executes Tasks
        console.log(`[Runner] Scheduler starting queue execution...`);
        await schedulerService.processQueue(parentTask.id, teamId, 'PARALLEL');
        // 5. Consensus aggregates results
        console.log(`[Runner] Reaching consensus using strategy: ${team.consensusStrategy}`);
        const completedTasks = await taskService.getSubTasks(parentTask.id);
        const finalOutput = await consensusService.aggregate(parentTask, completedTasks, team.consensusStrategy);
        await taskService.completeTask(parentTask.id, finalOutput);
        console.log(`[Runner] Objective Complete.`);
        return finalOutput;
    }
}
exports.MultiAgentRunner = MultiAgentRunner;
