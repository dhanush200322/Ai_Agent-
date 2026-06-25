"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionNode = void 0;
class ConditionNode {
    type = 'condition';
    async execute(node, context) {
        const conditionExpression = node.config?.expression;
        if (!conditionExpression) {
            return { status: 'FAILED', error: 'Missing condition expression' };
        }
        try {
            // Resolve variables in expression
            const resolvedExpression = await context.variables.resolveString(conditionExpression);
            // Basic JS evaluation in sandbox simulation
            let result = false;
            try {
                result = !!eval(resolvedExpression);
            }
            catch (e) {
                return { status: 'FAILED', error: `Condition evaluation error: ${e.message}` };
            }
            const trueNodeId = node.config.trueNodeId;
            const falseNodeId = node.config.falseNodeId;
            const nextNodes = [];
            if (result && trueNodeId)
                nextNodes.push(trueNodeId);
            if (!result && falseNodeId)
                nextNodes.push(falseNodeId);
            return {
                status: 'COMPLETED',
                output: { result, evaluated: resolvedExpression },
                nextNodes
            };
        }
        catch (e) {
            return { status: 'FAILED', error: e.message };
        }
    }
    validate(node) {
        if (!node.config?.expression)
            return ['Missing condition expression'];
        return null;
    }
}
exports.ConditionNode = ConditionNode;
