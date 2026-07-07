'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboard } from '@/hooks/useDashboard';
import { 
  LayoutDashboard, 
  Bot, 
  Database, 
  MessageSquare, 
  GitMerge, 
  Store, 
  Lock,
  Building2,
  Users,
  Shield,
  CreditCard,
  Activity,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAVIGATION_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'Overview' },
  
  { label: 'Agents', href: '/dashboard/agents', icon: Bot, section: 'Workspace' },
  { label: 'Knowledge', href: '/dashboard/knowledge', icon: Database, section: 'Workspace' },
  { label: 'Chat', href: '/dashboard/chat', icon: MessageSquare, section: 'Workspace' },
  { label: 'Workflows', href: '/dashboard/workflows', icon: GitMerge, section: 'Workspace' },
  
  { label: 'Organization', href: '/dashboard/organization', icon: Building2, section: 'Administration' },
  { label: 'Users', href: '/dashboard/users', icon: Users, section: 'Administration' },
  { label: 'Roles', href: '/dashboard/roles', icon: Shield, section: 'Administration' },
  { label: 'Vault', href: '/dashboard/vault', icon: Lock, section: 'Administration' },
  
  { label: 'Settings', href: '/dashboard/settings', icon: Settings, section: 'Platform' },
];

export function NavigationMenu() {
  const pathname = usePathname();
  const { isSidebarCollapsed, setMobileMenuOpen } = useDashboard();
  
  const groupedItems = NAVIGATION_ITEMS.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof NAVIGATION_ITEMS>);

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
      {Object.entries(groupedItems).map(([section, items]) => (
        <div key={section} className="space-y-1">
          {!isSidebarCollapsed && (
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {section}
            </h4>
          )}
          {isSidebarCollapsed && <div className="h-4" />}
          
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              
              return (
                <li key={item.label}>
                  <Link 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      relative flex items-center px-3 py-2 rounded-lg transition-all duration-200 group
                      ${isActive ? 'text-white bg-[rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}
                      ${isSidebarCollapsed ? 'justify-center' : ''}
                    `}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav" 
                        className="absolute inset-0 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#D4AF37]' : ''}`} />
                    
                    {!isSidebarCollapsed && (
                      <span className="ml-3 font-medium text-sm whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
