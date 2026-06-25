"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalNodeRegistry = void 0;
exports.initializeNodeRegistry = initializeNodeRegistry;
const registry_1 = require("./registry");
Object.defineProperty(exports, "globalNodeRegistry", { enumerable: true, get: function () { return registry_1.globalNodeRegistry; } });
const ai_node_1 = require("./ai.node");
const tool_node_1 = require("./tool.node");
const webhook_node_1 = require("./webhook.node");
const approval_node_1 = require("./approval.node");
const condition_node_1 = require("./condition.node");
const misc_nodes_1 = require("./misc.nodes");
function initializeNodeRegistry() {
    registry_1.globalNodeRegistry.register(new ai_node_1.AiNode());
    registry_1.globalNodeRegistry.register(new tool_node_1.ToolNode());
    registry_1.globalNodeRegistry.register(new webhook_node_1.WebhookNode());
    registry_1.globalNodeRegistry.register(new approval_node_1.ApprovalNode());
    registry_1.globalNodeRegistry.register(new condition_node_1.ConditionNode());
    registry_1.globalNodeRegistry.register(new misc_nodes_1.LoopNode());
    registry_1.globalNodeRegistry.register(new misc_nodes_1.DelayNode());
    // A generic mock trigger node for tests
    registry_1.globalNodeRegistry.register({
        type: 'trigger',
        execute: async (_node, _ctx) => ({ status: 'COMPLETED', output: { success: true } }),
        validate: () => null
    });
}
