import { TeamService } from './team.service';
import { TaskService } from './task.service';

const teamService = new TeamService();
const taskService = new TaskService();

export class DelegationService {
  /**
   * Delegates a task based on capability requirements.
   * If no agent has the exact capability, assigns to any agent with WORKER role via round-robin.
   */
  async delegateTask(taskId: string, teamId: string, requiredCapability: string) {
    const capableAgents = await teamService.getCapableAgents(teamId, requiredCapability);

    let assignedAgentId: string;

    if (capableAgents.length > 0) {
      // Pick the highest priority agent
      assignedAgentId = capableAgents[0].agentId;
    } else {
      // Fallback: Pick a random WORKER agent
      const team = await teamService.getTeam(teamId);
      if (!team) throw new Error('Team not found');
      
      const workers = team.members.filter(m => m.role === 'WORKER');
      if (workers.length === 0) throw new Error('No capable agents or workers available in team');
      
      // Simple round robin (random for now)
      const randomIdx = Math.floor(Math.random() * workers.length);
      assignedAgentId = workers[randomIdx].agentId;
    }

    return taskService.assignTask(taskId, assignedAgentId);
  }
}
