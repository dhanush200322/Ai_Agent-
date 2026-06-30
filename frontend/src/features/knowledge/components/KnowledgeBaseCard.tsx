import React from 'react';
import { Database, Clock, MoreVertical, FileText } from 'lucide-react';
import Link from 'next/link';
import { KnowledgeBase } from '../types/knowledge';

interface KnowledgeBaseCardProps {
  kb: KnowledgeBase;
}

export const KnowledgeBaseCard: React.FC<KnowledgeBaseCardProps> = ({ kb }) => {
  return (
    <Link href={`/dashboard/knowledge/${kb.id}`}>
      <div className="group relative bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 transition-all hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(212,175,55,0.2)] cursor-pointer h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] flex items-center justify-center">
            <Database className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <button className="text-gray-500 hover:text-white p-1 rounded-md transition-colors" onClick={(e) => e.preventDefault()}>
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-[#D4AF37] transition-colors">{kb.name}</h3>
        <p className="text-sm text-gray-400 mb-6 line-clamp-2 flex-grow">{kb.description || 'No description provided.'}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.05)] text-xs text-gray-500">
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {new Date(kb.updatedAt).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <FileText className="w-3.5 h-3.5 mr-1" />
            Documents
          </div>
        </div>
      </div>
    </Link>
  );
};
