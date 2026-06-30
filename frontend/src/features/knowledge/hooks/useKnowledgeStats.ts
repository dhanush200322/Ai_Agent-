import { useQuery } from '@tanstack/react-query';
import { knowledgeService } from '../services/knowledge.service';
import { KnowledgeDocument } from '../types/knowledge';

export function useAllKnowledgeStats(kbIds: string[] | undefined) {
  return useQuery({
    queryKey: ['knowledge-stats', kbIds],
    queryFn: async () => {
      if (!kbIds || kbIds.length === 0) return null;
      
      const allDocsPromises = kbIds.map(id => knowledgeService.getDocuments(id));
      const results = await Promise.allSettled(allDocsPromises);
      
      let allDocs: KnowledgeDocument[] = [];
      results.forEach(res => {
        if (res.status === 'fulfilled') {
          allDocs = [...allDocs, ...res.value];
        }
      });

      const stats = {
        totalDocuments: allDocs.length,
        processing: 0,
        completed: 0,
        failed: 0,
        pending: 0,
        storageBytes: 0
      };

      allDocs.forEach(doc => {
        if (doc.size) stats.storageBytes += doc.size;
        
        switch (doc.status) {
          case 'COMPLETED':
            stats.completed++;
            break;
          case 'FAILED':
            stats.failed++;
            break;
          case 'PENDING':
            stats.pending++;
            break;
          case 'PROCESSING':
          case 'EMBEDDING':
          case 'INDEXING':
            stats.processing++;
            break;
        }
      });

      return stats;
    },
    enabled: !!kbIds && kbIds.length > 0,
    refetchInterval: 5000 // Poll every 5s for live updates
  });
}
