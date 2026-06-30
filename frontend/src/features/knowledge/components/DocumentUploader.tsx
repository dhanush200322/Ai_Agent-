import React, { useCallback, useState } from 'react';
import { UploadCloud, File, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUploadDocument } from '../hooks/useKnowledge';

interface DocumentUploaderProps {
  knowledgeBaseId: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ knowledgeBaseId }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const { mutateAsync: uploadDocument, isPending } = useUploadDocument(knowledgeBaseId);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // We only support single file upload in this MVP per the backend route `.single('file')`
    const file = files[0];

    // Backend validates these types, we do early return here
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'];
    if (!validTypes.includes(file.type)) {
      setUploadStatus({ type: 'error', message: 'Invalid file type. Supported: PDF, DOCX, TXT, Markdown.' });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadStatus({ type: 'error', message: 'File size exceeds 20MB limit.' });
      return;
    }

    try {
      setUploadStatus({ type: 'idle', message: '' });
      await uploadDocument(file);
      setUploadStatus({ type: 'success', message: 'Document uploaded successfully!' });
      setTimeout(() => setUploadStatus({ type: 'idle', message: '' }), 3000);
    } catch (err: any) {
      setUploadStatus({ type: 'error', message: err.response?.data?.message || 'Failed to upload document.' });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files);
    // Reset value so same file can be uploaded again if needed
    e.target.value = '';
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
        isDragging 
          ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.05)]' 
          : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.2)]'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isPending ? (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
          <p className="text-white font-medium">Uploading Document...</p>
        </div>
      ) : uploadStatus.type === 'success' ? (
        <div className="flex flex-col items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
          <p className="text-emerald-500 font-medium">{uploadStatus.message}</p>
        </div>
      ) : uploadStatus.type === 'error' ? (
        <div className="flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-500 font-medium mb-4">{uploadStatus.message}</p>
          <button 
            onClick={() => setUploadStatus({ type: 'idle', message: '' })}
            className="px-4 py-2 bg-[rgba(255,255,255,0.05)] rounded-lg text-sm text-gray-300 hover:text-white"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Drag & Drop Documents</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            Support for PDF, DOCX, TXT, and Markdown files up to 20MB.
          </p>
          
          <label className="cursor-pointer">
            <span className="bg-[rgba(212,175,55,0.1)] hover:bg-[rgba(212,175,55,0.2)] border border-[rgba(212,175,55,0.2)] text-[#D4AF37] px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Browse Files
            </span>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.docx,.txt,.md,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileInput}
            />
          </label>
        </div>
      )}
    </div>
  );
};
