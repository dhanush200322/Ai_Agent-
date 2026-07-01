'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { useRoles, usePermissions, useCreateRole, useUpdateRole, useDeleteRole, useAssignPermission, useRemovePermission } from '@/services/rbac/rbac.service';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { Shield, Plus, MoreVertical, Check, X, Search, Edit2, Trash2 } from 'lucide-react';

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'matrix'>('list');
  const [search, setSearch] = useState('');
  
  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();

  const filteredRoles = roles?.filter(r => r.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <ContentWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <PageHeader 
          title="Roles & Permissions"
          description="Manage enterprise roles and granular access control."
        />
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'list' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Roles List
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'matrix' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Permission Matrix
            </button>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" /> Create Role
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search roles..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full md:w-96 bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingRoles ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 bg-white/5 animate-pulse rounded-xl border border-white/10" />
                ))
              ) : filteredRoles.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState 
                    icon={Shield}
                    title="No Roles Found"
                    description="No custom roles available. Create one to manage permissions."
                  />
                </div>
              ) : (
                filteredRoles.map((role: any, index: number) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={role.id} 
                    className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:bg-white/[0.07] transition-colors relative group"
                  >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button className="p-1.5 bg-black/20 hover:bg-white/10 text-slate-300 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          {role.name}
                          {role.isSystem && <span className="text-[10px] bg-slate-500/20 text-slate-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">System</span>}
                        </h3>
                        <p className="text-sm text-slate-400">Updated {new Date(role.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-300 mb-6 min-h-[40px] line-clamp-2">{role.description || 'No description provided.'}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-xl font-bold text-white">{role._count?.users || 0}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Users</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <p className="text-xl font-bold text-indigo-400">{role._count?.permissions || role.permissions?.length || 0}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Permissions</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-white">{new Date(role.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric'})}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Created</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="matrix" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <PermissionMatrix roles={roles} permissions={permissions} isLoading={isLoadingRoles || isLoadingPermissions} />
          </motion.div>
        )}
      </AnimatePresence>
    </ContentWrapper>
  );
}

function PermissionMatrix({ roles, permissions, isLoading }: { roles: any, permissions: any, isLoading: boolean }) {
  const assignMutation = useAssignPermission();
  const removeMutation = useRemovePermission();

  if (isLoading) {
    return <div className="h-96 bg-white/5 animate-pulse rounded-xl border border-white/10" />;
  }

  // Group permissions by resource (e.g., 'users', 'agents', 'knowledge')
  const resources = Array.from(new Set(permissions?.map((p: any) => p.resource))) as string[];
  const actions = ['view', 'create', 'update', 'delete', 'manage']; // Standard CRUD map

  const hasPermission = (role: any, resource: string, action: string) => {
    return role.permissions?.some((p: any) => p.resource === resource && p.action === action);
  };

  const getPermissionId = (resource: string, action: string) => {
    return permissions?.find((p: any) => p.resource === resource && p.action === action)?.id;
  };

  const togglePermission = async (role: any, resource: string, action: string) => {
    const permId = getPermissionId(resource, action);
    if (!permId) return;

    if (hasPermission(role, resource, action)) {
      await removeMutation.mutateAsync({ roleId: role.id, permissionId: permId });
    } else {
      await assignMutation.mutateAsync({ roleId: role.id, permissionId: permId });
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 bg-black/20 border-b border-r border-white/10 min-w-[150px]">
                <span className="text-slate-400 font-medium">Resources</span>
              </th>
              {roles?.map((role: any) => (
                <th key={role.id} className="p-4 bg-black/20 border-b border-white/10 text-center min-w-[120px]">
                  <div className="text-white font-semibold">{role.name}</div>
                  {role.isSystem && <div className="text-[10px] text-slate-400 mt-1 uppercase">System</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.map((resource, i) => (
              <React.Fragment key={resource}>
                {/* Resource Header Row */}
                <tr className="bg-white/[0.02]">
                  <td colSpan={roles?.length + 1} className="p-3 border-b border-white/5 text-indigo-300 font-semibold uppercase text-xs tracking-wider">
                    {resource}
                  </td>
                </tr>
                {/* Action Rows */}
                {actions.map(action => {
                  const permExists = permissions?.some((p: any) => p.resource === resource && p.action === action);
                  if (!permExists) return null; // Skip if this resource doesn't have this action
                  
                  return (
                    <tr key={`${resource}-${action}`} className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-3 border-r border-white/5 pl-8 text-sm text-slate-300 capitalize">
                        {action}
                      </td>
                      {roles?.map((role: any) => (
                        <td key={role.id} className="p-3 text-center">
                          <button
                            disabled={role.isSystem} // System roles usually can't be modified
                            onClick={() => togglePermission(role, resource, action)}
                            className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-colors ${
                              hasPermission(role, resource, action)
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                : 'bg-black/20 text-slate-600 border border-white/5 hover:bg-white/10 hover:text-slate-400'
                            } ${role.isSystem ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {hasPermission(role, resource, action) ? <Check className="w-3.5 h-3.5" /> : <X className="w-3 h-3" />}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
