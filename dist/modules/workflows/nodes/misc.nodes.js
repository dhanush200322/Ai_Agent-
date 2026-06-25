"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelayNode = exports.LoopNode = void 0;
class LoopNode {
    type = 'loop';
    async execute(node, context) {
        const listPath = node.config?.listVariable; // e.g. "execution.items"
        if (!listPath)
            return { status: 'FAILED', error: 'Missing listVariable' };
        try {
            const list = context.variables.resolveString(`{{${listPath}}}`);
            let parsedList;
            try {
                parsedList = typeof list === 'string' ? JSON.parse(list) : list;
            }
            catch {
                parsedList = [];
            }
            if (!Array.isArray(parsedList)) {
                return { status: 'FAILED', error: 'listVariable is not an array' };
            }
            const currentIndex = context.variables.getScope().execution[`${node.id}_index`] || 0;
            if (currentIndex < parsedList.length) {
                // Set loop item in execution context
                const itemVarName = node.config?.itemVariable || 'currentItem';
                context.variables.setExecutionVariable(itemVarName, parsedList[currentIndex]);
                // Update index
                context.variables.setExecutionVariable(`${node.id}_index`, currentIndex + 1);
                // Branch to loop body
                return { status: 'COMPLETED', nextNodes: [node.config?.loopNodeId], output: { item: parsedList[currentIndex], index: currentIndex } };
            }
            else {
                // Reset index
                context.variables.setExecutionVariable(`${node.id}_index`, 0);
                // Branch to done
                return { status: 'COMPLETED', nextNodes: [node.config?.doneNodeId], output: { done: true } };
            }
        }
        catch (e) {
            return { status: 'FAILED', error: e.message };
        }
    }
    validate(node) {
        if (!node.config?.listVariable)
            return ['Missing listVariable'];
        return null;
    }
}
exports.LoopNode = LoopNode;
class DelayNode {
    type = 'delay';
    async execute(node, _context) {
        const delayMs = parseInt(node.config?.delayMs || '0', 10);
        // In a real robust system, this would PAUSE and schedule a wakeup via the ExecutionDispatcher (queue).
        // For local simulation, we just block.
        if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        return { status: 'COMPLETED', output: { delayMs } };
    }
    validate() { return null; }
}
exports.DelayNode = DelayNode;
