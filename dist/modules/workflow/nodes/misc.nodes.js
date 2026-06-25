"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelayNode = exports.LoopNode = void 0;
class LoopNode {
    type = 'loop';
    async execute(node, context) {
        const listPath = node.config?.listVariable;
        if (!listPath)
            return { status: 'FAILED', error: 'Missing listVariable' };
        try {
            const listStr = await context.variables.resolveString(`{{${listPath}}}`);
            let parsedList;
            try {
                parsedList = typeof listStr === 'string' ? JSON.parse(listStr) : listStr;
            }
            catch {
                parsedList = [];
            }
            if (!Array.isArray(parsedList)) {
                return { status: 'FAILED', error: 'listVariable is not an array' };
            }
            const currentIndex = context.variables.getScope().execution[`${node.id}_index`] || 0;
            if (currentIndex < parsedList.length) {
                const itemVarName = node.config?.itemVariable || 'currentItem';
                context.variables.setExecutionVariable(itemVarName, parsedList[currentIndex]);
                context.variables.setExecutionVariable(`${node.id}_index`, currentIndex + 1);
                return {
                    status: 'COMPLETED',
                    nextNodes: [node.config?.loopNodeId],
                    output: { item: parsedList[currentIndex], index: currentIndex }
                };
            }
            else {
                context.variables.setExecutionVariable(`${node.id}_index`, 0);
                return {
                    status: 'COMPLETED',
                    nextNodes: [node.config?.doneNodeId],
                    output: { done: true }
                };
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
        if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        return { status: 'COMPLETED', output: { delayMs } };
    }
    validate() {
        return null;
    }
}
exports.DelayNode = DelayNode;
