import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            isRead: false
          },
          ...state.notifications
        ].slice(0, 50) // Keep only last 50 notifications
      })),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      })),
      clearAll: () => set({ notifications: [] })
    }),
    {
      name: 'notification-storage'
    }
  )
);
