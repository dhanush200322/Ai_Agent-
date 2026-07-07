'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const notifications = useNotificationStore(state => state.notifications);
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-full transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#050505]"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-[rgba(15,15,15,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center">
              <h3 className="font-medium text-white">Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
              <button onClick={() => markAllAsRead()} className="text-xs text-[#D4AF37] hover:text-white transition-colors">Mark all as read</button>
            </div>
            
            <div className="max-h-96 overflow-y-auto custom-scrollbar pb-2">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`px-4 py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer border-l-2 ${notif.isRead ? 'border-transparent opacity-60' : 'border-[#D4AF37]'}`}
                  >
                    <p className="text-sm text-gray-200">{notif.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                    <p className="text-[10px] text-gray-600 mt-2">
                      {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
