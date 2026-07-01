'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { useUsers, useUpdateUserStatus, useDeleteUser } from '@/services/users/users.service';
import { useRoles } from '@/services/rbac/rbac.service';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { Search, Filter, MoreVertical, Shield, Mail, Calendar, CheckCircle2, XCircle, AlertCircle, Trash2, Download, UserPlus, Clock, Users } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { data: usersData, isLoading: isLoadingUsers } = useUsers(1, 100, search, statusFilter, roleFilter);
  const { data: rolesData } = useRoles();
  
  const updateStatusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteUser();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && usersData?.data) {
      setSelectedUsers(usersData.data.map((u: any) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(userId => userId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleBulkAction = async (action: 'ACTIVE' | 'SUSPENDED' | 'DELETE') => {
    if (action === 'DELETE') {
      if (confirm('Are you sure you want to delete selected users?')) {
        for (const id of selectedUsers) {
          await deleteMutation.mutateAsync(id);
        }
      }
    } else {
      for (const id of selectedUsers) {
        await updateStatusMutation.mutateAsync({ id, status: action });
      }
    }
    setSelectedUsers([]);
  };

  const exportCSV = () => {
    if (!usersData?.data) return;
    const headers = ['Name', 'Email', 'Role', 'Status', 'Created At'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + usersData.data.map((u: any) => `${u.firstName} ${u.lastName},${u.email},${u.role?.name},${u.status},${new Date(u.createdAt).toISOString()}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ContentWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <PageHeader 
          title="Users Management"
          description="Manage enterprise users, roles, and access."
        />
        <button 
          onClick={() => { /* Open Invite Modal */ }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 appearance-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="PENDING">Pending Invitation</option>
        </select>
        <select 
          value={roleFilter} 
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 appearance-none"
        >
          <option value="">All Roles</option>
          {rolesData?.map((r: any) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {selectedUsers.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mb-6"
        >
          <span className="text-indigo-300 font-medium">{selectedUsers.length} users selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('ACTIVE')} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-sm hover:bg-emerald-500/30">Activate</button>
            <button onClick={() => handleBulkAction('SUSPENDED')} className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-md text-sm hover:bg-amber-500/30">Suspend</button>
            <button onClick={() => handleBulkAction('DELETE')} className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-md text-sm hover:bg-rose-500/30">Delete</button>
            <button onClick={exportCSV} className="px-3 py-1 flex items-center gap-1 bg-white/10 text-white rounded-md text-sm hover:bg-white/20"><Download className="w-4 h-4" /> Export CSV</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20 text-slate-400 text-sm">
                <th className="p-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={(usersData?.data?.length || 0) > 0 && selectedUsers.length === (usersData?.data?.length || 0)}
                    onChange={handleSelectAll}
                    className="rounded border-white/20 bg-black/50 text-indigo-500 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Last Login</th>
                <th className="p-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {isLoadingUsers ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-4"><div className="w-4 h-4 bg-white/5 rounded animate-pulse" /></td>
                    <td className="p-4 flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                      <div className="space-y-2"><div className="w-24 h-4 bg-white/5 rounded animate-pulse" /><div className="w-32 h-3 bg-white/5 rounded animate-pulse" /></div>
                    </td>
                    <td className="p-4"><div className="w-20 h-5 bg-white/5 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="w-16 h-5 bg-white/5 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="w-24 h-4 bg-white/5 rounded animate-pulse" /></td>
                    <td className="p-4"></td>
                  </tr>
                ))
              ) : usersData?.data?.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState 
                      icon={Users}
                      title="No Users Found"
                      description="No users match your filters. Try adjusting your search criteria."
                    />
                  </td>
                </tr>
              ) : (
                usersData?.data?.map((user: any, index: number) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={user.id} 
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                      router.push(`/dashboard/users/${user.id}`);
                    }}
                  >
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-white/20 bg-black/50 text-indigo-500 focus:ring-indigo-500"
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.firstName} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-medium border border-indigo-500/30">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">{user.firstName} {user.lastName} {user.isOwner && <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">Owner</span>}</div>
                          <div className="text-sm text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                        <Shield className="w-3.5 h-3.5" />
                        {user.role?.name || 'No Role'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        user.status === 'SUSPENDED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {user.status === 'ACTIVE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {user.status === 'SUSPENDED' && <XCircle className="w-3.5 h-3.5" />}
                        {user.status === 'INACTIVE' && <AlertCircle className="w-3.5 h-3.5" />}
                        {user.status}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {user.lastLogin ? (
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(user.lastLogin).toLocaleDateString()}</div>
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors" onClick={e => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ContentWrapper>
  );
}
