import { TaskService } from './task.service';
import { DelegationService } from './delegation.service';

const taskService = new TaskService();
const delegationService = new DelegationService();

export class SchedulerService {
  /**
   * Scans a parent task for its subtasks and executes them based on concurrency strategy.
   * For the sake of this mock engine, we simulate sequential execution if they are assigned.
   */
  async processQueue(parentTaskId: string, teamId: string, concurrency: 'SEQUENTIAL' | 'PARALLEL' = 'PARALLEL') {
    const subTasks = await taskService.getSubTasks(parentTaskId);

    if (concurrency === 'PARALLEL') {
      await Promise.all(subTasks.map(task => this.executeTaskNode(task.id, teamId)));
    } else {
      for (const task of subTasks) {
        await this.executeTaskNode(task.id, teamId);
      }
    }
  }

  private async executeTaskNode(taskId: string, teamId: string) {
    // 1. Delegate (Find Agent)
    // Here we assume the task requires a specific capability based on its input parsing (mocked here)
    const requiredCapability = this.mockParseRequiredCapability(); 
    await delegationService.delegateTask(taskId, teamId, requiredCapability);

    // 2. Start
    await taskService.startTask(taskId);

    // 3. In a real engine, we would invoke the Agent's Planner loop here.
    // For this scaffold, we mock a successful execution.
    const mockOutput = `Task ${taskId} executed successfully by agent`;
    
    // 4. Complete
    await taskService.completeTask(taskId, mockOutput);
  }

  private mockParseRequiredCapability() {
    return 'knowledge.search'; // Simplistic mock for structural validation
  }
}
