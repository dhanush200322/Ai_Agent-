import React from 'react';
import { FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import { Citation } from '../../types/chat';

export const SourceCitationCard: React.FC<{ citation: Citation }> = ({ citation }) => {
  const percentage = Math.round((citation.score || 0) * 100);

  return (
    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors group cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-zinc-800 rounded-lg">
            <FileText className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white truncate max-w-[150px]" title={citation.originalName}>
              {citation.originalName}
            </p>
            <p className="text-xs text-zinc-500">
              {citation.page ? `Page ${citation.page}` : 'Document Segment'}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
            {percentage}% Match
          </span>
          <ExternalLink className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      
      <div className="text-xs text-zinc-400 line-clamp-2 mt-2 italic bg-zinc-950 p-2 rounded-lg border border-zinc-800/50">
        "{citation.snippet}"
      </div>
    </div>
  );
};
