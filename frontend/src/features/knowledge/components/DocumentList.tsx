import React, { useState } from 'react';
import { FileText, Globe, Layers, Edit3, HardDrive, MoreVertical, Search, Trash2, Download, RotateCw } from 'lucide-react';
import { KnowledgeDocument } from '../types/knowledge';
import { useDeleteDocument } from '../hooks/useKnowledge';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/EmptyState';
import { DocumentDetailsModal } from './DocumentDetailsModal';

interface DocumentListProps {
  documents: KnowledgeDocument[];
  knowledgeBaseId: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, knowledgeBaseId }) => {
  const [search, setSearch] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [viewDoc, setViewDoc] = useState<KnowledgeDocument | null>(null);
  
  const { mutateAsync: deleteDocument } = useDeleteDocument(knowledgeBaseId);

  const filteredDocs = documents.filter(doc => 
    doc.originalName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDocs(new Set(filteredDocs.map(d => d.id)));
    } else {
      setSelectedDocs(new Set());
    }
  };

  const handleSelectDoc = (id: string) => {
    const newSet = new Set(selectedDocs);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedDocs(newSet);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        toast.success('Document deleted');
      } catch (err) {
        toast.error('Failed to delete document');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedDocs.size} documents?`)) {
      try {
        // Backend doesn't have a bulk delete endpoint, so we run them sequentially or concurrently
        const promises = Array.from(selectedDocs).map(id => deleteDocument(id));
        await Promise.all(promises);
        toast.success(`Deleted ${selectedDocs.size} documents`);
        setSelectedDocs(new Set());
      } catch (err) {
        toast.error('Failed to delete some documents');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'PROCESSING': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'FAILED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'WEBSITE': return <Globe className="w-4 h-4 mr-3 text-blue-400" />;
      case 'FAQ': return <Layers className="w-4 h-4 mr-3 text-purple-400" />;
      case 'TEXT': return <Edit3 className="w-4 h-4 mr-3 text-emerald-400" />;
      case 'DOCUMENT':
      default: return <FileText className="w-4 h-4 mr-3 text-gray-500" />;
    }
  };

  const getSourceTypeDisplay = (type: string, ext?: string) => {
    if (type === 'DOCUMENT') return ext?.toUpperCase() || 'FILE';
    return type;
  };

  if (documents.length === 0) {
    return (
      <EmptyState 
        icon={FileText}
        title="No Documents Uploaded"
        description="Upload files to start building your knowledge base."
      />
    );
  }

  return (
    <div className="bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-[rgba(255,255,255,0.1)] rounded-lg bg-[rgba(255,255,255,0.02)] text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors text-sm"
          />
        </div>

        {/* Bulk Actions */}
        {selectedDocs.size > 0 && (
          <div className="flex items-center space-x-2 bg-[rgba(212,175,55,0.1)] px-3 py-1.5 rounded-lg border border-[rgba(212,175,55,0.2)]">
            <span className="text-sm text-[#D4AF37] font-medium mr-2">{selectedDocs.size} selected</span>
            <button 
              onClick={handleBulkDelete}
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors" 
              title="Delete Selected"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              className="p-1.5 text-gray-400 opacity-50 cursor-not-allowed rounded transition-colors" 
              title="Retry Processing (Unsupported)"
              disabled
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button 
              className="p-1.5 text-gray-400 opacity-50 cursor-not-allowed rounded transition-colors" 
              title="Download Selected (Unsupported)"
              disabled
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[rgba(255,255,255,0.02)] text-gray-500 uppercase text-xs border-b border-[rgba(255,255,255,0.05)]">
            <tr>
              <th scope="col" className="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-[rgba(255,255,255,0.2)] bg-transparent text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0"
                  checked={selectedDocs.size === filteredDocs.length && filteredDocs.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th scope="col" className="px-6 py-4 font-medium">File Name</th>
              <th scope="col" className="px-6 py-4 font-medium">Type</th>
              <th scope="col" className="px-6 py-4 font-medium">Size</th>
              <th scope="col" className="px-6 py-4 font-medium">Status</th>
              <th scope="col" className="px-6 py-4 font-medium">Uploaded Date</th>
              <th scope="col" className="px-6 py-4 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc) => (
              <tr 
                key={doc.id} 
                className="border-b border-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                onClick={() => setViewDoc(doc)}
              >
                <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    className="rounded border-[rgba(255,255,255,0.2)] bg-transparent text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0"
                    checked={selectedDocs.has(doc.id)}
                    onChange={() => handleSelectDoc(doc.id)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {getSourceIcon(doc.sourceType)}
                    <span className="text-white font-medium truncate max-w-[200px] sm:max-w-[300px]" title={doc.originalName}>
                      {doc.originalName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 uppercase text-xs font-semibold">{getSourceTypeDisplay(doc.sourceType, doc.extension)}</td>
                <td className="px-6 py-4">{doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center w-fit ${getStatusColor(doc.status)}`}>
                    {doc.status}
                    {(doc.status === 'PENDING' || doc.status === 'PROCESSING' || doc.status === 'EMBEDDING' || doc.status === 'INDEXING') && (
                      <span className="ml-1 animate-pulse">...</span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(doc.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => handleDelete(doc.id)} className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-500 hover:text-white p-1 rounded transition-colors" disabled>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredDocs.length === 0 && search && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No documents match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {viewDoc && (
        <DocumentDetailsModal document={viewDoc} onClose={() => setViewDoc(null)} />
      )}
    </div>
  );
};
