import { prisma } from '../../../shared/prisma';
import { PrismaClient, NotificationChannel, NotificationPreference } from '@prisma/client';



export interface PreferenceResolutionContext {
  organizationId: string;
  userId?: string;
  department?: string;
  team?: string;
}

export class PreferenceEngine {
  async resolvePreferences(context: PreferenceResolutionContext): Promise<any> {
    const { organizationId, userId, department, team } = context;

    const preferences = await prisma.notificationPreference.findMany({
      where: {
        organizationId,
      },
    });

    let resolved: any = {
      enabledChannels: '["EMAIL", "SMS", "WHATSAPP", "PUSH", "SLACK", "MS_TEAMS", "DISCORD", "WEBHOOK", "IN_APP"]',
      disabledChannels: '[]',
      quietHoursStart: null,
      quietHoursEnd: null,
      digestMode: false,
      language: 'en',
      timezone: 'UTC',
    };

    const orgPref = preferences.find(p => !p.userId && !p.team && !p.department);
    const deptPref = department ? preferences.find(p => p.department === department && !p.userId && !p.team) : null;
    const teamPref = team ? preferences.find(p => p.team === team && !p.userId) : null;
    const userPref = userId ? preferences.find(p => p.userId === userId) : null;

    if (orgPref) resolved = { ...resolved, ...orgPref };
    if (deptPref) resolved = { ...resolved, ...deptPref };
    if (teamPref) resolved = { ...resolved, ...teamPref };
    if (userPref) resolved = { ...resolved, ...userPref };

    return resolved;
  }

  isChannelEnabled(resolvedPref: any, channel: NotificationChannel): boolean {
    let enabled: string[] = [];
    let disabled: string[] = [];

    try {
      if (resolvedPref.enabledChannels) {
        enabled = typeof resolvedPref.enabledChannels === 'string'
          ? JSON.parse(resolvedPref.enabledChannels)
          : resolvedPref.enabledChannels;
      }
    } catch (e) {
      enabled = [];
    }

    try {
      if (resolvedPref.disabledChannels) {
        disabled = typeof resolvedPref.disabledChannels === 'string'
          ? JSON.parse(resolvedPref.disabledChannels)
          : resolvedPref.disabledChannels;
      }
    } catch (e) {
      disabled = [];
    }

    if (disabled.includes(channel)) return false;
    if (enabled.length > 0 && !enabled.includes(channel)) return false;
    return true;
  }

  isInQuietHours(resolvedPref: any): boolean {
    if (!resolvedPref.quietHoursStart || !resolvedPref.quietHoursEnd) {
      return false;
    }

    const [startH, startM] = resolvedPref.quietHoursStart.split(':').map(Number);
    const [endH, endM] = resolvedPref.quietHoursEnd.split(':').map(Number);

    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMin = now.getUTCMinutes();

    const startVal = startH * 60 + startM;
    const endVal = endH * 60 + endM;
    const nowVal = currentHour * 60 + currentMin;

    if (startVal < endVal) {
      return nowVal >= startVal && nowVal <= endVal;
    } else {
      return nowVal >= startVal || nowVal <= endVal;
    }
  }
}
