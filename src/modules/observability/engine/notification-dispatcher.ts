export interface NotificationDispatcher {
  dispatch(channelConfig: string, subject: string, message: string, severity: string): Promise<boolean>;
}

export class DefaultNotificationDispatcher implements NotificationDispatcher {
  async dispatch(_channelConfig: string, subject: string, _message: string, severity: string): Promise<boolean> {
    // JSON.parse(channelConfig || '{}'); // ignoring config for now
    
    // Abstracting actual delivery. 
    // Example: if (config.type === 'WEBHOOK') fetch(config.url, ...)
    console.log(`[NotificationDispatcher] Sent ${severity} Alert: ${subject}`);
    return true;
  }
}
