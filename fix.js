const fs = require('fs');
const engines = ['Gateway', 'Provider', 'Routing', 'Reasoning', 'Prompt', 'ModelSelection', 'Token', 'Cost', 'Cache', 'Embedding', 'Streaming', 'Json', 'FunctionCalling', 'Vision', 'Audio', 'Monitoring', 'Safety', 'Conversation'];

engines.forEach(e => {
  const filename = e.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '.engine.ts';
  fs.writeFileSync('src/modules/model-gateway/engine/' + filename, 'export class ' + e + 'Engine {}');
});

const workers = ['Completion', 'Embedding', 'Streaming', 'Monitoring', 'Retry', 'Cost', 'PromptApproval', 'ModelHealth'];
workers.forEach(w => {
  const filename = w.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '.worker.ts';
  fs.writeFileSync('src/modules/model-gateway/workers/' + filename, 'export class ' + w + 'Worker {}');
});
