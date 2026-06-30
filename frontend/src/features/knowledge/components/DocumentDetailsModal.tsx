import React from 'react';
import { X, FileText, Database, Clock, Layers, User, Calendar, Activity, CheckSquare } from 'lucide-react';
import { KnowledgeDocument } from '../types/knowledge';

interface DocumentDetailsModalProps {
  document: KnowledgeDocument;
  onClose: () => void;
}

export const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({ document, onClose }) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-emerald-500';
      case 'PROCESSING': 
      case 'EMBEDDING':
      case 'INDEXING': return 'text-blue-500';
      case 'FAILED': return 'text-red-500';
      case 'PENDING': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const isComplete = (status: string, target: string[]) => target.includes(status) || document.status === 'COMPLETED';
  const isCurrent = (status: string) => document.status === status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-[#151515]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white truncate max-w-sm" title={document.originalName}>
                {document.originalName}
              </h2>
              <p className="text-sm text-gray-400 uppercase tracking-wider">{document.extension} • {document.size ? formatBytes(document.size) : '-'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Metadata Grid */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center">
              <Database className="w-4 h-4 mr-2 text-[#D4AF37]" />
              Metadata
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <p className={`text-sm font-bold ${getStatusColor(document.status)}`}>{document.status}</p>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-xs text-gray-500 mb-1">Chunks</p>
                <p className="text-sm font-bold text-white">{document.chunkCount || 0}</p>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-xs text-gray-500 mb-1">Uploaded By</p>
                <div className="flex items-center text-sm font-bold text-white">
                  <User className="w-3 h-3 mr-1 text-gray-400" />
                  User
                </div>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-xs text-gray-500 mb-1">Uploaded Date</p>
                <div className="flex items-center text-sm font-bold text-white">
                  <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                  {new Date(document.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-xs text-gray-500 mb-1">Processing Time</p>
                <div className="flex items-center text-sm font-bold text-white">
                  <Clock className="w-3 h-3 mr-1 text-gray-400" />
                  {document.processingTime ? `${(document.processingTime / 1000).toFixed(1)}s` : '-'}
                </div>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-xs text-gray-500 mb-1">Model</p>
                <div className="flex items-center text-sm font-bold text-white truncate" title={document.embeddingModel || 'None'}>
                  <Activity className="w-3 h-3 mr-1 text-gray-400" />
                  {document.embeddingModel || 'None'}
                </div>
              </div>
            </div>
          </div>

          {/* Processing Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-[#D4AF37]" />
              Processing History
            </h3>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative">
              <div className="absolute left-9 top-10 bottom-10 w-0.5 bg-zinc-800"></div>
              
              <div className="space-y-6 relative z-10">
                
                {/* Uploaded */}
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isComplete(document.status, ['PENDING', 'PROCESSING', 'EMBEDDING', 'INDEXING', 'COMPLETED']) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-zinc-800 border-zinc-700 text-gray-500'}`}>
                    {isComplete(document.status, ['PENDING', 'PROCESSING', 'EMBEDDING', 'INDEXING', 'COMPLETED']) ? <CheckSquare className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-gray-500" />}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-bold text-white">Uploaded</h4>
                    <p className="text-xs text-gray-500">Document saved to storage</p>
                  </div>
                </div>

                {/* Parsing */}
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isComplete(document.status, ['PROCESSING', 'EMBEDDING', 'INDEXING', 'COMPLETED']) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : isCurrent('PENDING') ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 'bg-zinc-800 border-zinc-700 text-gray-500'}`}>
                    {isComplete(document.status, ['PROCESSING', 'EMBEDDING', 'INDEXING', 'COMPLETED']) ? <CheckSquare className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-gray-500" />}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-bold text-white">Queued / Parsing {isCurrent('PENDING') && <span className="text-blue-500 ml-2 animate-pulse">████</span>}</h4>
                    <p className="text-xs text-gray-500">Extracting text content from file</p>
                  </div>
                </div>

                {/* Chunking */}
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isComplete(document.status, ['EMBEDDING', 'INDEXING', 'COMPLETED']) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : isCurrent('PROCESSING') ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 'bg-zinc-800 border-zinc-700 text-gray-500'}`}>
                    {isComplete(document.status, ['EMBEDDING', 'INDEXING', 'COMPLETED']) ? <CheckSquare className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-gray-500" />}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-bold text-white">Chunking {isCurrent('PROCESSING') && <span className="text-blue-500 ml-2 animate-pulse">████</span>}</h4>
                    <p className="text-xs text-gray-500">Splitting text into semantic fragments</p>
                  </div>
                </div>

                {/* Embedding */}
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isComplete(document.status, ['INDEXING', 'COMPLETED']) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : isCurrent('EMBEDDING') ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 'bg-zinc-800 border-zinc-700 text-gray-500'}`}>
                    {isComplete(document.status, ['INDEXING', 'COMPLETED']) ? <CheckSquare className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-gray-500" />}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-bold text-white">Embedding {isCurrent('EMBEDDING') && <span className="text-blue-500 ml-2 animate-pulse">████</span>}</h4>
                    <p className="text-xs text-gray-500">Generating vector representations</p>
                  </div>
                </div>

                {/* Indexed */}
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isComplete(document.status, ['COMPLETED']) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : isCurrent('INDEXING') ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 'bg-zinc-800 border-zinc-700 text-gray-500'}`}>
                    {isComplete(document.status, ['COMPLETED']) ? <CheckSquare className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-gray-500" />}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-bold text-white">Indexed {isCurrent('INDEXING') && <span className="text-blue-500 ml-2 animate-pulse">████</span>}</h4>
                    <p className="text-xs text-gray-500">Saved to Vector Database (Qdrant)</p>
                  </div>
                </div>

                {/* Completed or Failed */}
                {document.status === 'FAILED' ? (
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 bg-red-500/20 border-red-500 text-red-500">
                      <X className="w-3 h-3" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-bold text-red-500">Failed</h4>
                      <p className="text-xs text-red-400 mt-1">{document.errorMessage || 'An error occurred during processing.'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${document.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-zinc-800 border-zinc-700 text-gray-500'}`}>
                      {document.status === 'COMPLETED' ? <CheckSquare className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-gray-500" />}
                    </div>
                    <div className="ml-4">
                      <h4 className={`text-sm font-bold ${document.status === 'COMPLETED' ? 'text-emerald-500' : 'text-gray-500'}`}>Completed</h4>
                      <p className="text-xs text-gray-500">Ready for search</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
