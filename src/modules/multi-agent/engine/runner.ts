import { TeamService } from '../services/team.service';
import { TaskService } from '../services/task.service';
import { SchedulerService } from '../services/scheduler.service';
import { ConsensusService } from '../services/consensus.service';
import { MessageBusService } from '../services/message-bus.service';

const teamService = new TeamService();
const taskService = new TaskService();
const schedulerService = new SchedulerService();
const consensusService = new ConsensusService();
const messageBusService = new MessageBusService();

export class MultiAgentRunner {
  /**
   * The entry point for multi-agent execution.
   */
  async run(teamId: string, objective: string): Promise<string> {
    const team = await teamService.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    console.log(`[Runner] Initiating objective for Team: ${team.name}`);

    // 1. Create Parent Task
    const parentTask = await taskService.createTask(teamId, objective, 100);

    // 2. Manager Delegation (Mock: break into 3 subtasks)
    console.log(`[Runner] Manager decomposing objective into 3 subtasks...`);
    await taskService.createTask(teamId, `Research Phase`, 10, parentTask.id);
    await taskService.createTask(teamId, `Planning Phase`, 10, parentTask.id);
    await taskService.createTask(teamId, `Execution Phase`, 10, parentTask.id);

    // 3. Broadcast Team Kickoff Message
    await messageBusService.broadcast(
      team.createdById, // the user orchestrating
      teamId,
      `Starting Team Objective: ${objective}`,
      'UPDATE',
      parentTask.id
    );

    // 4. Scheduler Executes Tasks
    console.log(`[Runner] Scheduler starting queue execution...`);
    await schedulerService.processQueue(parentTask.id, teamId, 'PARALLEL');

    // 5. Consensus aggregates results
    console.log(`[Runner] Reaching consensus using strategy: ${team.consensusStrategy}`);
    const completedTasks = await taskService.getSubTasks(parentTask.id);
    
    const finalOutput = await consensusService.aggregate(parentTask, completedTasks, team.consensusStrategy as any);

    await taskService.completeTask(parentTask.id, finalOutput);

    console.log(`[Runner] Objective Complete.`);
    return finalOutput;
  }
}
