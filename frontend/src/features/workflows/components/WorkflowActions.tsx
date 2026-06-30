import React, { useState } from 'react';
import { Save, Rocket, Play, Loader2, X } from 'lucide-react';

export default function WorkflowActions({ 
  onSave, 
  onPublish, 
  onExecute, 
  isSaving 
}: { 
  onSave: () => void, 
  onPublish: () => void, 
  onExecute: (variables: any) => void,
  isSaving: boolean 
}) {
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [variablesJson, setVariablesJson] = useState('{\n  \n}');

  const handleExecuteClick = () => {
    // If we can determine the workflow requires variables, show modal. 
    // For now, always show modal as an option, but user can just click Run immediately.
    setShowExecuteModal(true);
  };

  const handleRun = () => {
    try {
      const vars = JSON.parse(variablesJson || '{}');
      onExecute(vars);
      setShowExecuteModal(false);
    } catch (e) {
      alert('Invalid JSON variables');
    }
  };

  return (
    <>
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden p-1 gap-1">
        <button 
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Draft
        </button>
        <div className="w-px bg-zinc-800 mx-1" />
        <button 
          onClick={onPublish}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 rounded-md text-sm font-medium text-white transition-colors"
        >
          <Rocket className="w-4 h-4 text-purple-500" />
          Publish
        </button>
        <div className="w-px bg-zinc-800 mx-1" />
        <button 
          onClick={handleExecuteClick}
          className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-md text-sm font-medium transition-colors"
        >
          <Play className="w-4 h-4" />
          Execute
        </button>
      </div>

      {showExecuteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Execute Workflow</h2>
              <button onClick={() => setShowExecuteModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Variables (Optional)
                </label>
                <textarea
                  value={variablesJson}
                  onChange={(e) => setVariablesJson(e.target.value)}
                  className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white font-mono focus:ring-1 focus:ring-yellow-500 outline-none resize-none"
                  placeholder='{"key": "value"}'
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Provide a valid JSON object. Leave empty braces <code>{'{}'}</code> if none required.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowExecuteModal(false)}
                className="px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleRun}
                className="px-4 py-2 bg-yellow-500 text-black text-sm font-medium rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Run Immediately
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
